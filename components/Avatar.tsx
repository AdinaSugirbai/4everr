
type AvatarProps = {
  name: string;
  size?: number;
  ring?: number;
};

export default function Avatar({ name, size = 96, ring = 58 }: AvatarProps) {
  return (
    <div
      className="rounded-full bg-soft text-brand grid place-items-center font-bold"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        fontSize: ring / 2,
      }}
    >
      {name.split(" ").map((word) => word[0]).join("")}
    </div>
  );
}
