<template>
	<cover-view :class="classStr" :style="styleStr" v-if="coverView">
		<cover-image :src="iconPath" class="cover-image" ></cover-image>
	</cover-view>
	<view :class="classStr" :style="styleStr" v-else>
		<image :src="iconPath" class="cover-image"></image>
	</view>
</template>

<script>
	export default {
		props: {
			name: {
				type: String,
				required:true
			},
			className: {
				type: String,
				default: ''
			},
			styleName:{
				type: String,
				default: ''
			},
			size: {
				type: [String, Number],
				default: ''
			},
			coverView: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			iconPath () {
				return `../../static/images/${this.name}.png`
			},
			classStr () {
				return  'm-icon-image ' + this.className
			},
			styleStr () {
				const sizeType = typeof this.size
				let s = ''
				if (sizeType === 'undefined') {
					s = ''
				} else if (sizeType === 'number') {
					s = `width: ${this.size}px; height: ${this.size}px;`
				} else {
					s = `width: ${this.size}; height: ${this.size};`
				}
				return this.styleName + ' ' + s
			},
		}
	}
</script>

<style lang="scss" scoped>
	.m-icon-image {
		width: 100%;
		height: 100%;
		.cover-image {
			width: 100%;
			height: 100%;
		}
	}
</style>