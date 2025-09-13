export function updateEyeLook(
  room: RoomObject,
  eyeId: number,
  pupilId: number,
  targetX: number,
  targetY: number
) {
  const eye = room.getDiscProperties(eyeId);
  if (!eye) return;
  const dx = targetX - eye.x;
  const dy = targetY - eye.y;
  const dist = Math.hypot(dx, dy);
  let dirx = 0,
    diry = 0;
  if (dist > 0.001) {
    dirx = dx / dist;
    diry = dy / dist;
  }
  const pupilOffset = 40;
  const px = eye.x + dirx * pupilOffset;
  const py = eye.y + diry * pupilOffset;
  room.setDiscProperties(pupilId, { x: px, y: py });
}
