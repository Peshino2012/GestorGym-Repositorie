import Image from "next/image";

const GRADIENTS = [
  "from-primary to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-sky-500 to-indigo-400",
  "from-fuchsia-500 to-pink-400",
  "from-amber-500 to-yellow-400",
];

const SIZES = {
  sm: { className: "h-9 w-9 text-xs", px: 36 },
  md: { className: "h-12 w-12 text-sm", px: 48 },
  lg: { className: "h-20 w-20 text-xl", px: 80 },
} as const;

function hashIndex(str: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % mod;
  return Math.abs(hash);
}

export default function Avatar({
  name,
  photoUrl,
  size = "md",
  interactive = false,
}: {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof SIZES;
  /** adds a hover-scale transition — use when the avatar sits inside a hoverable link/row */
  interactive?: boolean;
}) {
  const { className, px } = SIZES[size];
  const motion = interactive
    ? "transition-transform duration-200 group-hover:scale-110"
    : "";

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        className={`${className} ${motion} shrink-0 rounded-full object-cover`}
      />
    );
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const gradient = GRADIENTS[hashIndex(name, GRADIENTS.length)];

  return (
    <div
      className={`flex ${className} ${motion} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white`}
    >
      {initials}
    </div>
  );
}
