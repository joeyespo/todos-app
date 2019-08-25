import React from 'react';
import PropTypes from 'prop-types';
import { Button, StyleSheet, Text, View, ViewPropTypes } from 'react-native';

export default function TodoItem({ completed, style, text, onComplete }) {
  return (
    <View style={[styles.container, completed ? styles.completed : {}, style]}>
      <Button style={styles.checkbox} color="#ccc" title="&#x2714;" onPress={onComplete} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

TodoItem.propTypes = {
  style: ViewPropTypes.style,
  completed: PropTypes.bool,
  text: PropTypes.string,
  onComplete: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 2,
    elevation: 1,
  },
  completed: {
    backgroundColor: '#eee',
  },
  checkbox: {
    backgroundColor: '#ccc',
    color: '#333',
  },
  text: {
    marginLeft: 12,
    fontSize: 18,
  },
});
