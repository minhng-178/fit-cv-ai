import { THEME_COLORS } from "@/constants";

interface MiniCVPreviewProps {
  themeColor: string;
}

export function MiniCVPreview({ themeColor }: MiniCVPreviewProps) {
  const color = THEME_COLORS[themeColor] || THEME_COLORS.emerald;

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden flex flex-col">
      {/* Header strip */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: color + "15",
          borderBottom: `2px solid ${color}`,
        }}
      >
        <div
          className="h-2.5 rounded-full w-3/4 mb-1.5"
          style={{ backgroundColor: color + "60" }}
        />
        <div
          className="h-1.5 rounded-full w-1/2"
          style={{ backgroundColor: color + "40" }}
        />
        <div
          className="h-1.5 rounded-full w-2/5 mt-1"
          style={{ backgroundColor: color + "30" }}
        />
      </div>

      {/* Body skeleton */}
      <div className="flex flex-1 gap-2 p-3">
        {/* Left column */}
        <div className="w-2/5 flex flex-col gap-2">
          <div className="h-2 rounded bg-gray-200 w-3/4" />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-5/6" />
            <div className="h-1.5 rounded bg-gray-100 w-4/6" />
          </div>
          <div className="h-2 rounded bg-gray-200 w-2/3 mt-1" />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-3/4" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200" />

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-2">
          <div
            className="h-2 rounded w-1/2"
            style={{ backgroundColor: color + "50" }}
          />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-11/12" />
            <div className="h-1.5 rounded bg-gray-100 w-4/5" />
          </div>
          <div
            className="h-2 rounded w-1/2 mt-1"
            style={{ backgroundColor: color + "50" }}
          />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-3/4" />
            <div className="h-1.5 rounded bg-gray-100 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
