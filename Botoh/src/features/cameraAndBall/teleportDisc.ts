export function teleportDisc(
  room: RoomObject,
  discIndex: number,
  props: Partial<DiscPropertiesObject>
) {
  if (!props || props.x === undefined || props.y === undefined) {
    console.log("⚠ teleportDisc: missing x or y");
    return;
  }

  const x = props.x - 30;
  const y = props.y;

  room.setDiscProperties(discIndex, { x, y });
}
