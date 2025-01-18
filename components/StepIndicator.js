import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <View style={styles.stepWrapper}>
              <View style={[
                styles.stepDot,
                index <= currentStep && styles.stepDotActive,
                index === currentStep && styles.stepDotCurrent
              ]}>
                <Text style={[
                  styles.stepNumber,
                  index <= currentStep && styles.stepNumberActive
                ]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[
                styles.stepText,
                index === currentStep && styles.stepTextActive
              ]}>
                {step}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStep && styles.stepLineActive
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stepWrapper: {
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#666666',
  },
  stepDotCurrent: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 80,
  },
  stepTextActive: {
    color: '#333333',
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    marginTop: -12,
  },
  stepLineActive: {
    backgroundColor: '#666666',
  },
});

export default StepIndicator; 