
import questionData from '../../../question.json';

export type QuestionType = 'select' | 'multiselect' | 'checkbox' | 'text' | 'textarea' | 'date' | 'time' | 'number' | 'radio' | 'end';

export type Answers = Record<string, any>;

export type Condition =
  | { id: string; op: 'eq'; value: any }
  | { id: string; op: 'in'; value: any[] }
  | { id: string; op: 'truthy' };

export type ShowWhen =
  | Condition
  | Condition[]
  | { or: Condition[][] };

export type Option = { value: string; label?: string; next?: string };

export type Question = {
  id: string;
  label: string;
  helpText?: string;
  type: QuestionType;
  required?: boolean;
  options?: Option[];
  placeholder?: string;
  showWhen?: ShowWhen;
  storageKey?: string; // Key to map to in answers (e.g., all stations -> 'station')
  next?: string; // Explicit next question ID
};

export type FormSchema = {
  title: string;
  description?: string;
  questions: Question[];
};

export function isVisible(q: Question, answers: Answers): boolean {
  if (!q.showWhen) return true;

  // Helper to evaluate a group of AND conditions
  const evaluateGroup = (rules: Condition[] | Condition) => {
    const arr = Array.isArray(rules) ? rules : [rules];
    return arr.every(r => {
      const v = answers[r.id];
      if (r.op === 'truthy') return !!v && (!(Array.isArray(v)) || v.length > 0);
      if (r.op === 'eq') return v === r.value;
      if (r.op === 'in') return Array.isArray(r.value) && r.value.includes(v);
      return true;
    });
  };

  // Handle OR logic
  if ('or' in q.showWhen) {
    return q.showWhen.or.some(group => evaluateGroup(group));
  }

  // Handle standard AND logic (single object or array)
  return evaluateGroup(q.showWhen as Condition[] | Condition);
}

// Allow loose typing for the imported JSON to avoid TS friction during import
type JsonQuestion = {
  id: string;
  text: string;
  type: string;
  options?: (string | { label: string; next?: string })[];
  next?: string;
  required?: boolean;
  note?: string; // Maps to helpText
  description?: string; // Maps to helpText
  example?: string; // Maps to helpText/placeholder
};

type JsonForm = {
  formTitle?: string;
  questions: JsonQuestion[];
};

// --- ADAPTER LOGIC ---

// Mapping from JSON IDs to Application Field IDs
const ID_ALIAS: Record<string, string> = {
  Q1: 'email',
  Q2: 'section', // Maps to answers.section
  Q22: 'date',
  Q23: 'shift',
  Q24: 'classification',
  Q25: 'gearMaintained',
  Q26: 'maintenanceDetails',
  Q27: 'specialWorkOn',
  Q28: 'specialWorkDetailsTrack',
  Q29: 'specialWorkDetailsSignal',
  Q30: 'specialWorkDetailsPoint',
  Q31: 'specialWorkDetailsLocationBox',
  Q32: 'specialWorkDetailsPowerRoom',
  Q33: 'specialWorkDetailsRelayRoom',
  Q34: 'specialWorkDetailsLCGate',
  Q35: 'specialWorkDetailsHUT',
  Q36: 'specialWorkDetailsAutoSection',
  Q37: 'specialWorkDetailsOther',
  Q38: 'otherDeptDetails',
  Q39: 'miscDetails',
  Q59: 'replaceGear',
  Q40: 'failureStatus',
  Q42: 'gearFailed',
  Q43: 'failureClassification',
  Q44: 'inTime',
  Q45: 'rtTime',
  Q46: 'failureDetails',
  Q47: 'actualFailureDetails',
  Q48: 'trainDetention',
  Q49: 'hasDisconnection',
  Q50: 'discNo', // disconnectionNo
  Q51: 'discStatus',
  Q52: 'discPermission',
  Q53: 'discFor',
  Q54: 'discDate',
  Q55: 'discTime',
  Q56: 'reconDate',
  Q57: 'reconTime',
  Q58: 'discDetails/Reason'
};

// Questions that should share a single storage key
const STORAGE_KEYS: Record<string, string> = {
  // All station questions (Q3-Q21) write to 'station'
  Q3: 'station', Q4: 'station', Q5: 'station', Q6: 'station', Q7: 'station',
  Q8: 'station', Q9: 'station', Q10: 'station', Q11: 'station', Q12: 'station',
  Q13: 'station', Q14: 'station', Q15: 'station', Q16: 'station', Q17: 'station',
  Q18: 'station', Q19: 'station', Q20: 'station', Q21: 'station'
};

function generateSchema(jsonData: any): FormSchema {
  // Handles the fact that question.json has separate objects if not merged field
  // But we fixed it to be one object.
  const rawQuestions: JsonQuestion[] = jsonData.questions || [];

  // 1. Convert JSON Questions to Application Questions
  // And build a map for easy lookup
  const qMap = new Map<string, Question>();
  const convertedQuestions: Question[] = [];

  rawQuestions.forEach(rq => {
    // Determine Type
    let type: QuestionType = 'text';
    if (rq.type === 'radio') type = 'select'; // Radio typically becomes Select in our UI
    else if (rq.type === 'checkbox') type = 'multiselect';
    else if (rq.type === 'end') type = 'end'; // We might filter these out or render as message
    else if (['date', 'time', 'number', 'textarea'].includes(rq.type)) type = rq.type as QuestionType;

    // Determine Options
    let options: Option[] | undefined = undefined;
    if (rq.options) {
      options = rq.options.map(o => {
        if (typeof o === 'string') return { value: o, label: o };
        return { value: o.label, label: o.label, next: o.next };
      });
    }

    // Determine ID and interactions
    const id = rq.id;
    const storageKey = STORAGE_KEYS[id] || ID_ALIAS[id] || id; // Default to ID if no alias

    // Help Text
    const helpText = rq.note || rq.description || rq.example;

    const q: Question = {
      id,
      label: rq.text,
      type,
      required: rq.required,
      options,
      helpText,
      storageKey: storageKey !== id ? storageKey : undefined,
      // If we aliased the ID, we might still want to keep original ID for logic graph,
      // but use alias for storage.
      // Wait, FormRenderer uses `q.id` for key. Logic graph uses `q.id`.
      // Storage uses `storageKey`.
      // This is perfect.
      next: rq.next
    };

    qMap.set(id, q);
    convertedQuestions.push(q);
  });

  // 2. Build Visibility Logic Graph
  // We need to determine `showWhen` for every node.
  // Method: Accumulate incoming triggering conditions.
  // map[TargetID] -> Array<ConditionGroup> (OR list)

  const incomingConditions = new Map<string, Condition[][]>();

  // Initialize Q1 as always visible (empty AND group = true)
  // incomingConditions.set('Q1', [[]]); 

  // Helper to add condition
  const addCondition = (targetId: string, condGroup: Condition[]) => {
    if (!incomingConditions.has(targetId)) {
      incomingConditions.set(targetId, []);
    }
    incomingConditions.get(targetId)?.push(condGroup);
  };

  // Traverse all questions to find edges
  // Traverse all questions to find edges
  convertedQuestions.forEach((q, index) => {
    // Determine the default sequential next question
    const sequentialNext = rawQuestions[index + 1]?.id;

    if (q.options) {
      q.options.forEach(opt => {
        // Target is either explicit next OR sequential next
        const targetId = opt.next || sequentialNext;

        if (targetId) {
          // Edge: Q -> targetId
          // Condition: Q's value == opt.value
          const key = q.storageKey || ID_ALIAS[q.id] || q.id;

          // Add condition to the target's incoming list
          const rule: Condition = { id: key, op: 'eq', value: opt.value };
          addCondition(targetId, [rule]);
        }
      });
    } else if (q.next) {
      // Unconditional jump defined in JSON
      // Target Logic inherits Source Logic? 
      // This is hard to represent in flat `showWhen`.
      // BUT, notice that in the form, unconditional jumps usually imply "Next Step".
      // Use Implicit Flow?
      // If we don't set `showWhen`, it renders always?
      // No, we want it hidden until we reach it.
      // Hack: Use `truthy` on previous question?
      // What if previous is optional?
      // Let's rely on the fact that JSON flow is explicit.
      // If a node is ONLY reached via specific options, it works.
      // If a node is reached via "Next", it's usually part of a linear sequence started by a conditional jump.
      // E.g. Q59 (Choice) -> Q60 (Text) -> Q61 (Choice).
      // Q60 is visible if Q59=Track.
      // Q61 is visible if Q60 is...... visible?
      // Q61 source condition = Q60 source condition!

      // We can do a propagation pass.
      // If no incoming Edges (from options), inherit from immediate predecessor in JSON array?
      // Q60 follows Q59. Q59 has options.
      // Q59 options that DON'T have `next` fall through to Q60?
      // JSON: `Q59` options: "Track (DCTC)" -> "Q60".
      // So Q60 has incoming edge.
      // "Signal" -> "Q66".
      // "Point" -> "Q74".
      // So Q60 is ONLY reachable if Q59=Track.
      // So Q60 `showWhen` = `Q59=Track`.

      // Q61 (Asset Replaced DCTC).
      // Predecessor: Q60.
      // Q60 has no options. Q60 implicitly goes to Q61.
      // So Q61 inherits Q60's visibility.
      // Q61 `showWhen` = Q60 `showWhen` = `Q59=Track`.
    }
  });

  // 3. Propagation Pass (Linear Flow)
  // We iterate forward. If a node has NO incoming conditional edges (from options),
  // we assume it inherits visibility from the previous node in the list.
  // This handles Q60 -> Q61.

  for (let i = 1; i < convertedQuestions.length; i++) {
    const curr = convertedQuestions[i];
    const prev = convertedQuestions[i - 1];

    // Check if curr has explicit incoming triggers
    if (!incomingConditions.has(curr.id)) {
      // If no triggers, inherit from previous (Linear Flow)
      // Check if previous exists
      if (incomingConditions.has(prev.id)) {
        const prevCond = incomingConditions.get(prev.id);
        if (prevCond) {
          // Deep copy to avoid reference issues
          const cloned = prevCond.map(g => [...g]);
          incomingConditions.set(curr.id, cloned);
        }
      } else {
        // Previous was effectively "Always Visible" (Root)
        // So this is also Root or Global.
      }
    } else {
      // It has triggers.
      // Check "Convergence".
      // If Q22 (Date) is triggered by Q3, Q4, Q5...
      // incomingConditions[Q22] = [[Q3=X], [Q4=Y]...]
    }
  }

  // 4. Assign showWhen to Questions
  convertedQuestions.forEach(q => {
    // Default Q1/Start to visible (no showWhen)
    if (incomingConditions.has(q.id)) {
      const paths = incomingConditions.get(q.id)!;
      if (paths.length === 0) return; // Always visible

      // If only 1 path with 1 condition, simplify
      if (paths.length === 1 && paths[0].length === 1) {
        q.showWhen = paths[0][0];
      } else if (paths.length === 1) {
        // AND logic only
        q.showWhen = paths[0];
      } else {
        // OR logic
        q.showWhen = { or: paths };
      }
    }
  });

  // 5. Special Fix for "End" questions or messages
  // Filter out type='end' if we don't want to render inputs?
  // User might want to see "Form Completion".
  // We'll leave it as type='text' (placeholder) or generic.
  // We mapped 'end' to 'end' type. FormRenderer needs to handle it or ignore.
  // We'll filter them out for now to cleanly "Stop".
  // Or keep them as readonly info.

  return {
    title: jsonData.formTitle || 'Log Book',
    description: 'Generated from JSON Schema',
    questions: convertedQuestions.filter(q => q.type !== 'end')
  };
}

export const WORK_LOG_BOOK_SCHEMA: FormSchema = generateSchema(questionData);
