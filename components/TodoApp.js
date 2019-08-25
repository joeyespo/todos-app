import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage, StyleSheet, View, ViewPropTypes } from 'react-native';
import Constants from 'expo-constants';
import { removed, request, uuidv4 } from '../utils';
import TodoList from './TodoList';

function setIsLoading(isLoading) {
  return { isLoading };
}

function addItems(items) {
  // Append items from external source first, then include all new local-only items
  return (prev) => ({
    items: [...items, ...(prev.items.filter(prevItem => !items.find(item => item.id === prevItem.id)))],
  });
}

function createItem(text) {
  return {
    id: uuidv4(),
    text,
    completed: false,
    synced: false,
  };
}

function addItem(text) {
  return ({ items }) => ({
    items: [...items, createItem(text)],
  });
}

function completeItem(id) {
  return ({ items }) => ({
    items: items.map(item => item.id === id ? { ...item, completed: true, synced: false } : item),
  });
}

function removeItem(id) {
  return ({ items }) => ({
    items: removed(items, items.find(item => item.id === id)),
  });
}

function setItemSynced(id) {
  return ({ items }) => ({
    items: items.map(item => item.id === id ? { ...item, synced: true } : item),
  });
}

function setLoadError(ex) {
  // TODO: Show / report error
  console.error(ex);
  return setIsLoading(false);
}

export default class TodoApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      items: [],
    }
    this.handleAdd = this.handleAdd.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentDidMount() {
    this.refresh(true);
  }

  async refresh(initial = false) {
    this.setState(setIsLoading(true));
    try {
      if (initial) {
        await this.load(() => {
          this.sync().then(() => {
            this.setState(setIsLoading(false));
          });
        });
      } else {
        await this.sync();
        this.setState(setIsLoading(false));
      }
    } catch (ex) {
      // TODO: Show / report error
      this.setState(setIsLoading(false));
    }
  }

  async load(cb) {
    const { storageKey } = this.props;
    if (!storageKey) {
      return;
    }

    const value = await AsyncStorage.getItem(storageKey);
    if (!value) {
      return;
    }

    const data = JSON.parse(value);
    if (!data || !data.items || !data.items.length) {
      return;
    }

    this.setState(addItems(data.items), () => {
      if (cb) {
        cb();
      }
    });
  }

  async save() {
    const { storageKey } = this.props;
    if (!storageKey) {
      return;
    }

    const { items } = this.state;
    const value = JSON.stringify({ items });
    await AsyncStorage.setItem(storageKey, value);
  }

  async sync() {
    const { apiUrl } = this.props;
    const prev = this.state;
    if (!apiUrl) {
      return;
    }

    // TODO: Bulk sync instead of one-at-a-time
    try {
      for (const item of prev.items) {
        // Skip  already-synced items
        if (item.synced) {
          continue;
        }

        if (item.completed) {
          try {
            await request(`${apiUrl}/todos/${item.id}/complete`, 'POST', {});
          } catch (ex) {
            // Ignore 404 errors
            // TODO: Handle this better
          }
          // TODO: Allow seeing completed items
          this.setState(removeItem(item.id));
        } else {
          await request(`${apiUrl}/todos/${item.id}`, 'POST', { text: item.text });
          this.setState(setItemSynced(item.id));
        }
      }

      const data = await request(`${apiUrl}/todos`);
      if (data && data.todos && data.todos.length) {
        this.setState(addItems(data.todos));
      }
    } catch (ex) {
      this.setState(setLoadError(ex));
    }
  }

  handleAdd(text) {
    this.setState(addItem(text), () => {
      this.save();
      // TODO: Debounce
      this.sync();
    });
  }

  handleComplete(id) {
    this.setState(completeItem(id), () => {
      this.save();
      // TODO: Debounce
      this.sync();
    });
  }

  handleRefresh() {
    this.refresh();
  }

  render() {
    const { isLoading, items } = this.state;
    return (
      <View style={styles.container}>
        <TodoList
          isLoading={isLoading}
          items={items.filter(item => !item.completed)}
          onAdd={this.handleAdd}
          onComplete={this.handleComplete}
          onRefresh={this.handleRefresh}
         />
      </View>
    );
  }
}

TodoApp.propTypes = {
  style: ViewPropTypes.style,
  storageKey: PropTypes.string,
  apiUrl: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12 + Constants.statusBarHeight,
    paddingBottom: 12,
    paddingHorizontal: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#1dd3ca',
  },
});
