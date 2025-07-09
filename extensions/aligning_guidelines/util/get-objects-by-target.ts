import type { FabricObject } from 'fa-editor';
import { ActiveSelection, Frame, Group } from 'fa-editor';

export function getObjectsByTarget(target: FabricObject) {
  const objects = new Set<FabricObject>();
  const canvas = target.canvas;
  const frameId = target.frameId;
  if (!canvas) return objects;
  const children =
    target instanceof ActiveSelection ? target.getObjects() : [target];

  // 画板内移动
  if (frameId) {
    canvas.forEachObject((o) => {
      if (!o.isOnScreen()) return;
      if (!o.visible) return;
      if (o.frameId != frameId && o.id != frameId) return;
      if (o.constructor == Group) {
        collectObjectsByGroup(objects, o);
        return;
      }
      objects.add(o);
    });
  } else {
    canvas.forEachObject((o) => {
      if (!o.isOnScreen()) return;
      if (!o.visible) return;
      if (o.constructor != Frame) return;
      objects.add(o);
    });
  }

  deleteObjectsByList(objects, children);
  return objects;
}

function deleteObjectsByList(objects: Set<FabricObject>, list: FabricObject[]) {
  for (const target of list) {
    if (target.constructor == Group) {
      deleteObjectsByList(objects, (target as Group).getObjects());
    } else {
      objects.delete(target);
    }
  }
}

function collectObjectsByGroup(objects: Set<FabricObject>, g: Group) {
  const children = g.getObjects();
  for (const child of children) {
    if (!child.visible) continue;
    if (child.constructor == Group) {
      collectObjectsByGroup(objects, child);
      continue;
    }
    objects.add(child);
  }
}
