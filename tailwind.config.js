module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        bubbleUpDown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(60px)" },
        },
        bubbleUpDownSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(120px)" },
        },
        bubbleUpDownAlt: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-70px)" },
        },
        bubbleUpDown2: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(40px)" },
        },
        bubbleLeftRight: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(60px)" },
        },
        bubbleLeftRightReverse: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-60px)" },
        },
        bubbleLeftRightShort: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(30px)" },
        },
        bubbleScale: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        bubbleScaleFast: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.4)" },
        },
        bubbleScaleAlt: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.8)" },
        },
        bubbleScaleSlow: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
        },
      },
      animation: {
        bubbleUpDown: "bubbleUpDown 8s ease-in-out infinite",
        bubbleUpDownSlow: "bubbleUpDownSlow 18s ease-in-out infinite reverse",
        bubbleUpDownAlt: "bubbleUpDownAlt 11s ease-in-out infinite alternate",
        bubbleUpDown2: "bubbleUpDown2 13s ease-in-out infinite",
        bubbleLeftRight: "bubbleLeftRight 10s ease-in-out infinite",
        bubbleLeftRightReverse:
          "bubbleLeftRightReverse 9s ease-in-out infinite reverse",
        bubbleLeftRightShort: "bubbleLeftRightShort 7s ease-in-out infinite",
        bubbleScale: "bubbleScale 12s ease-in-out infinite",
        bubbleScaleFast: "bubbleScaleFast 7s ease-in-out infinite",
        bubbleScaleAlt: "bubbleScaleAlt 9s ease-in-out infinite alternate",
        bubbleScaleSlow: "bubbleScaleSlow 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
