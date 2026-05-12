// TelemetryBar.tsx

interface Props {
  value: number;

  color?: string;

  icon: React.ReactNode;

  warning?: boolean;
  burst?: boolean;

  managingTyres?: boolean;

  dynamicTyre?: boolean;
  dynamicDamage?: boolean;

  align?: 'left' | 'right';
}

export function TelemetryBar({
  value,
  color,
  icon,
  warning,
  burst,
  managingTyres,
  dynamicTyre = false,
  dynamicDamage = false,
  align = 'left',
}: Props) {

  // =========================
  // TYRE COLOR
  // =========================

  const getTyreColor = () => {

    const v = Math.max(
      0,
      Math.min(100, value)
    );

    /*
      100 = verde
      30 = vermelho
      0 = preto
    */

    if (v <= 30) {

      const ratio = v / 30;

      const r = Math.round(
        255 * ratio
      );

      return `rgb(${r},0,0)`;
    }

    const ratio =
      (v - 30) / 70;

    const r = Math.round(
      255 * (1 - ratio)
    );

    const g = Math.round(
      255 * ratio
    );

    return `rgb(${r},${g},0)`;
  };

  // =========================
  // DAMAGE COLOR
  // =========================

  const getDamageColor = () => {

    const v = Math.max(
      0,
      Math.min(100, value)
    );

    /*
      100 = verde
      50 = vermelho
      0 = preto
    */

    // 50 -> 0
    // vermelho -> preto
    if (v <= 50) {

      const ratio = v / 50;

      const r = Math.round(
        255 * ratio
      );

      return `rgb(${r},0,0)`;
    }

    // 100 -> 50
    // verde -> vermelho
    const ratio =
      (v - 50) / 50;

    const r = Math.round(
      255 * (1 - ratio)
    );

    const g = Math.round(
      255 * ratio
    );

    return `rgb(${r},${g},0)`;
  };

  // =========================
  // FINAL COLOR
  // =========================

  let finalColor =
    color || '#FFFFFF';

  if (dynamicTyre) {
    finalColor =
      getTyreColor();
  }

  if (dynamicDamage) {
    finalColor =
      getDamageColor();
  }

  return (
    <div className="flex flex-col items-center">

      {/* TOP AREA */}
      <div className="relative mb-1 h-[24px] w-[32px]">

        {/* MAIN ICON */}
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            text-lg
          "
        >
          {icon}
        </div>

        {/* SIDE STATUS */}
        {(
          managingTyres !== undefined ||
          warning ||
          burst
        ) && (
          <div
            className={`
              absolute
              top-0
              flex
              flex-col
              items-center
              leading-none
              text-[12px]
              gap-2

              ${
                align === 'right'
                  ? 'left-[-14px]'
                  : 'right-[-14px]'
              }
            `}
          >

            {/* MANAGEMENT */}
            {managingTyres !== undefined && (
              <span>
                {managingTyres
                  ? '🧊'
                  : '🔥'}
              </span>
            )}

            {/* WARNING */}
            {warning && (
              <span className="text-yellow-400">
                ⚠
              </span>
            )}

            {/* BURST */}
            {burst && (
              <span>
                💥
              </span>
            )}
          </div>
        )}
      </div>

      {/* BAR */}
      <div
        className="
          relative
          w-[20px]
          h-[155px]
          bg-[#2A2A2A]
          overflow-hidden
          border-2
          border-black
        "
      >
        <div
          className="
            absolute
            bottom-0
            left-0
            w-full
            transition-all
            duration-300
          "
          style={{
            height: `${Math.max(value, 2)}%`,
            background: finalColor,
          }}
        />
      </div>

      {/* VALUE */}
      <div className="text-[16px] mt-1">
        {Math.round(value)}%
      </div>
    </div>
  );
}