<template>
<a :class="classname">{{text}}</a>
</template>
<script>
    export default {
        props: ['text', 'classname']
    }
</script>
