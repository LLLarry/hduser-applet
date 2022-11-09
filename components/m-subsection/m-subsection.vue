<template>
	<view class="m-subsection bg-white position-relative">
		<view class="m-subsection-menu padding-y-2 d-flex justify-content-around align-items-center bg-white text-size-md" >
			<view 
				class="m-subsection-menu-item  padding-x-2 flex-1 d-flex justify-content-center align-items-center"
				:class="{active: currentIndex === index}"
				v-for="(item, index) in sources" :key="index" @click="handleChange(index)">
				<view class="m-subsection-menu-item-text padding-x-2">
					{{item.name}}
				</view>
			</view>
		</view>
		<!-- 底部滑动条 -->
		<!-- <view class="line position-absolute bg-success" :style="lineStyleString"></view> -->
	</view>
</template>

<script>
	import { getElementInfo } from '@/utils/index.js'
	export default {
		name:"m-subsection",
		props: {
			list: {
				type: Array,
				default: () => ({})
			},
			currentIndex: {
				type: Number,
				default: -1
			}
		},
		data() {
			return {
				sources: [],
				lineInfo: {
					left: 0,
					width: 0
				}
			};
		},
		mounted () {
			
		},
		watch: {
			currentIndex: {
				handler (v) {
					const source = this.sources[v]
					if (!source) return false
					const {width, left} = source
					this.lineInfo = {
						width,
						left
					}
				},
				immediate: true
			},
			list: {
				handler (v) {
					const newV = JSON.parse(JSON.stringify(v))
					this.sources = newV.map(one => {
						return {
							...one,
							width: 0,
							left: 0,
						}
					})
					console.log('this.sources', this.sources)
					this.$nextTick(() => {
						console.log('$nextTick')
						this.initElementInfo()
					})
				},
				immediate: true
			}
		},
		computed: {
			lineStyleString () {
				console.log(`left: ${this.lineInfo.left}px; width: ${this.lineInfo.width}px;`)
				return `left: ${this.lineInfo.left}px; width: ${this.lineInfo.width}px;`
			}
		},
		methods: {
			handleChange (index) {
				this.$emit('change', index)
			},
			initElementInfo () {
				getElementInfo(this, '.m-subsection-menu-item-text', 1).then(data => {
					console.log(data)
					data.forEach((one, index) => {
						this.sources[index].width = one.width
						this.sources[index].left = one.left
						
						if (this.currentIndex === index) {
							this.lineInfo = {
								width: one.width,
								left: one.left
							}
						}
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.m-subsection {
	height: 80rpx;
	flex: 1;
	.m-subsection-menu-item {
		border-right: 1px solid #ccc;
		&:last-child {
			border-right: none;
		}
		&.active {
			.m-subsection-menu-item-text {
				color: #28a745;
				font-weight: bold;
			}
		}
	}
	.line {
		left: 0;
		bottom: 0;
		height: 8rpx;
		width: 0;
		transition: all .3s ease-in-out;
	}
}
</style>