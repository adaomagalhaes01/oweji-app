import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;
const SPLASH_HOLD_DURATION = 2500;
const SPLASH_EXIT_DURATION = 850;

const splashIntro = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 1.025 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.cubic) },
});

const splashExit = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.985 }], easing: Easing.out(Easing.cubic) },
});

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
    const timer = setTimeout(() => setAnimate(true), SPLASH_HOLD_DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return animate ? (
    <Animated.View
      key="splash-exit"
      entering={splashExit.duration(SPLASH_EXIT_DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      <SplashBrandContent />
    </Animated.View>
  ) : (
    <Animated.View key="splash-content" entering={splashIntro.duration(550)} style={styles.splashOverlay}>
      <SplashBrandContent />
    </Animated.View>
  );
}

export function SplashBrandContent() {
  return (
    <>
      <Image source={require('@/assets/products/splesh.jpeg')} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Retrato de uma mulher negra" />
      <View style={styles.splashShade} />
      <View style={styles.splashCenter}>
        <View style={styles.splashMark}><Text style={styles.markLetter}>O</Text></View>
        <Text style={styles.wordmark}>OWEJI</Text>
        <View style={styles.splashRule} />
        <Text style={styles.splashTagline}>Vista-se de si.</Text>
        <Text style={styles.splashCaption}>MARKETPLACE DE MODA</Text>
      </View>
      <View style={styles.splashBottom}><View style={styles.splashDot} /><View style={[styles.splashDot, styles.splashDotMuted]} /><View style={[styles.splashDot, styles.splashDotMuted]} /></View>
    </>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#5C3442',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  wordmark: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 31,
    letterSpacing: 8,
    marginTop: 17,
  },
  splashShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(48, 20, 33, 0.48)' },
  splashCenter: { alignItems: 'center', justifyContent: 'center', marginTop: -30 },
  splashMark: { width: 66, height: 66, borderRadius: 33, borderWidth: 1, borderColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  markLetter: { color: '#FFFFFF', fontFamily: 'Poppins_400Regular', fontSize: 36, lineHeight: 42 },
  splashRule: { width: 32, height: 1, backgroundColor: 'rgba(255,255,255,0.8)', marginTop: 14 },
  splashTagline: { color: '#FFFFFF', fontFamily: 'Poppins_500Medium', fontSize: 15, marginTop: 12, letterSpacing: 0.5 },
  splashCaption: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Poppins_600SemiBold', fontSize: 8, letterSpacing: 2, marginTop: 8 },
  splashBottom: { position: 'absolute', bottom: 58, flexDirection: 'row', alignItems: 'center', gap: 7 },
  splashDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFFFFF' },
  splashDotMuted: { backgroundColor: 'rgba(255,255,255,0.5)' },
});
