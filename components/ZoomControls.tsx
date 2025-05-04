import React from 'react';
import { View, Text, TouchableOpacity, Animated,useWindowDimensions, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

const zoomOptions = [0, 0.5, 1, 2, 3];

const ZoomControls = ({ zoom, setZoom, setShowZoomControls }) => {
  const animations = useRef(zoomOptions.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(100,
      animations.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);
    const { width, height } = useWindowDimensions();

  const radius = Math.min(width, height - 100) * 0.35;

  return (
    <View
      style={{
        flex: 1, padding: 10
      }}
    >
      {zoomOptions.map((level, i) => {
        const angle = (i / zoomOptions.length / 3) * 2 * Math.PI - Math.PI / 2; // Start at 12 o'clock
        const x = Math.cos(angle) * radius + 40;
        const y = Math.sin(angle) * radius + height / 4;

        return (
          <Animated.View
            key={level}
            style={{
  position: 'absolute',
  transform: [
    { translateX: animations[i].interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
    { translateY: animations[i].interpolate({ inputRange: [0, 1], outputRange: [0, y - 60] }) }, // ПІДНЯТИ ВИЩЕ
    { scale: animations[i] },
  ],
  opacity: animations[i],
}}

          >
            <TouchableOpacity
              onPress={() => setZoom(level / 10)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 25,
                backgroundColor: zoom === level ? "#ffffff" : "#ffffff30",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: zoom === level ? "black" : "white",
                  fontWeight: "600",
                }}
              >{level}x</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* X Close button in center */}
      <TouchableOpacity
        onPress={() => setShowZoomControls(false)}
        style={{
          width: 45,
          height: 45,
          borderRadius: 25,
          backgroundColor: "#ffffff30",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          left: 40,
          top: height / 7,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ZoomControls;
