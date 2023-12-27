import {CallTreeNode, Profile} from './profile'

export enum DiffOperation {
  MOVE = 'MOVE',
  INSERT = 'INSERT',
  DELETE = 'DELETE',
}

interface Operation {
  type: DiffOperation
  node: CallTreeNode
  parent?: CallTreeNode | null
  index?: number // index where the node should be inserted or the old index before the move
}

/**
 * Diff two profiles, returning an array of operations that would take the old profile
 * and transform it into the new profile
 */
export function getProfileDiff(beforeProfile: Profile, afterProfile: Profile): any {
  return diffTrees(
    beforeProfile.getAppendOrderCalltreeRoot(),
    afterProfile.getAppendOrderCalltreeRoot(),
  )
}

function diffTrees(
  before: CallTreeNode | null,
  after: CallTreeNode | null,
  parent: CallTreeNode | null = null,
): Operation[] {
  const operations: Operation[] = []

  if (!before && !after) {
    // No operation needed.
    return operations
  }

  if (!before) {
    // Node was inserted.
    operations.push({type: DiffOperation.INSERT, node: after!, parent})
    return operations
  }

  if (!after) {
    // Node was deleted.
    operations.push({type: DiffOperation.DELETE, node: before, parent})
    return operations
  }

  // If the keys are different, treat as a delete followed by an insert.
  if (before.key() !== after.key()) {
    operations.push({type: DiffOperation.DELETE, node: before, parent})
    operations.push({type: DiffOperation.INSERT, node: after, parent})
    return operations
  }

  // Compare children.
  const beforeChildren = before.children
  const afterChildren = after.children

  // TODO: Implement a heuristic to match children by "least difference" based on keys.
  // For now, we'll assume children are in the same order.
  for (let i = 0; i < Math.max(beforeChildren.length, afterChildren.length); i++) {
    operations.push(...diffTrees(beforeChildren[i], afterChildren[i], before))
  }

  return operations
}
