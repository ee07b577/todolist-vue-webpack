<template>
    <div>
        <p>
            <filter-component v-for="(filter, key) in filters" @click.native='filtrate(key)' :text='filter.text' :key="key" :classname="filter.isActive? 'active':''"></filter-component>
        </p>
        <transition-group
            name="todolist"
            tag="ul">
            <li v-for="(todo, index) in showlist"
            :class="todo.done? 'done' : '' "
            :key="index"
            @click="toggleDone(index)">
                {{todo.title}}
            </li>
        </transition-group>

        <p>
            <input type="text" v-model="newTodo" placeholder="add a todo" @keyup.enter="add">
            <button @click="add">添加</button>
        </p>

        <ul>
            <li v-for="type in typelist">{{type.name}}</li>
        </ul>
    </div>
</template>
<script>
import FilterComponent from './FilterComponent'
export default {
    components: {
        FilterComponent
    },
    data () {
        return {
            newTodo: '',
            filters: [{
                text: 'all',
                isActive: true
            }, {
                text: 'done',
                isActive: false
            }, {
                text: 'notDone',
                isActive: false
            }],
            currentFilter: 0,
            typelist: []
        }
    },
    computed: {
        todos() {
            return this.parseArrToObj(this.$store.state.todolist)
        },
        dones() {
            let todos = this.todos
            let ret = {}
            for (let key in todos) {
                if (todos[key].done) {
                    ret[key] = todos[key]
                }
            }
            return ret
        },
        notdones() {
            let todos = this.todos
            let ret = {}
            for (let key in todos) {
                if (!todos[key].done) {
                    ret[key] = todos[key]
                }
            }
            return ret
        },
        showlist() {
            switch (this.currentFilter) {
                case 0:
                    return this.todos
                    break;
                case 1:
                    return this.dones
                    break;
                default:
                    return this.notdones
            }
        }
    },
    created() {
    },
    methods: {
        parseArrToObj(arr) {
            let result = {}
            for (let i = 0, len = arr.length; i < len; i++) {
                result[i] = arr[i]
            }
            return result
        },
        add() {
            this
                .$store.commit('add', {
                    title: this.newTodo,
                    done: false
                })
            this.newTodo = ''
        },
        toggleDone(index) {
            this.$store.commit('toggleDone', index)
                // todo: 刷新待实现
        },
        filtrate(key) {
            this.currentFilter = key
            this.filters = this.filters.map(function(item) {
                item.isActive = false
                return item
            })
            this.filters[key].isActive = true

        }
    }
}
</script>
<style scoped>
    a {
        display: inline-block;
        width: 10%;
        padding: 0 5%;
        background: pink;
        border: 1px solid blue;
        cursor: pointer;
    }

    a.active {
        background: blue
    }

    .done {
        text-decoration: line-through
    }

    ul li {
        cursor: pointer
    }

    .todolist-enter-active, .todolist-leave-active {
      transition: all 1s;
    }
    .todolist-enter, .todolist-leave-to
    /* .list-leave-active for below version 2.1.8 */ {
      opacity: 0;
      transform: translateY(30px);
    }
</style>
