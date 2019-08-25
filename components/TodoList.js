import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlatList, Keyboard, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import TodoItem from './TodoItem';

function setInput(input) {
  return { input };
}

function clearInput() {
  return { input: '' };
}

// TODO: Extract <Input onSubmit={this.handleSubmit}> and make this a function / presentational component

export default class TodoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleComplete = this.handleSubmit.bind(this);
  }

  handleChange(value) {
    this.setState(setInput(value));
  }

  handleSubmit() {
    const { onAdd } = this.props;
    const { input } = this.state;

    const text = input.trim();
    if (!text) {
      Keyboard.dismiss();
      return;
    }

    if (onAdd) {
      onAdd(text);
    }
    this.setState(clearInput());
  }

  render() {
    const { isLoading, items, onComplete, onRefresh } = this.props;
    const { input } = this.state;
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          onChangeText={this.handleChange}
          onSubmitEditing={this.handleSubmit}
          placeholder="What needs to be done?"
          value={input}
          blurOnSubmit={false}
          autoFocus={true}
        />
        <FlatList
          style={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              key={item.id}
              style={styles.item}
              checked={item.completed}
              text={item.text}
              onComplete={() => onComplete && onComplete(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        />
      </View>
    );
  }
}

TodoList.propTypes = {
  isLoading: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string,
    complete: PropTypes.bool,
  })).isRequired,
  onRefresh: PropTypes.func,
  onAdd: PropTypes.func,
  onComplete: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    maxWidth: 480,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 18,
    padding: 12,
    borderColor: '#062725',
    borderWidth: 1,
  },
  item: {
    marginTop: 12,
  },
});
