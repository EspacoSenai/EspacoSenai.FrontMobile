import Animated from 'react-native-reanimated';

export const forSlideUpAndroid = ({ current, layouts }) => {
    'worklet';

    const translateY = Animated.interpolateNode(current.progress, {
        inputRange: [0, 1],
        outputRange: [layouts.screen.height, 0],
    });

    const opacity = Animated.interpolateNode(current.progress, {
        inputRange: [0, 0.7, 1],
        outputRange: [0, 0.5, 1],
    });

    return {
        cardStyle: {
            transform: [{ translateY }],
            opacity,
        },
    };
};