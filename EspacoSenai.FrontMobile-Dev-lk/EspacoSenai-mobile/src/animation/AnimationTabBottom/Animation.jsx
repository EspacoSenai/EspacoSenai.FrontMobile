import React from "react";
import Animated, {
    withTiming,
    useAnimatedStyle,
    interpolate,
} from "react-native-reanimated";

export default function AnimatedScreenWrapper({ index, currentIndex, children }) {
    const animatedStyle = useAnimatedStyle(() => {
        const isFocused = index === currentIndex;

        return {
            opacity: withTiming(isFocused ? 1 : 0, { duration: 220 }),
            transform: [
                {
                    translateX: withTiming(
                        isFocused ? 0 : 10,
                        { duration: 220 }
                    ),
                },
                {
                    scale: withTiming(isFocused ? 1 : 0.98, { duration: 220 }),
                },
            ],
        };
    });

    return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
}
