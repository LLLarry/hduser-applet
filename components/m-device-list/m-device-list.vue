<template>
	<view class="m-device-list padding-2 d-flex flex-column">
		<view>
			<u-search :animation="true" v-model="keywords" @search="search"></u-search>
		</view>
		<scroll-view class="flex-1 margin-top-2 overflow-auto" scroll-y="true" @scrolltolower="scrolltolower" v-if="renderList.length > 0" :scroll-top="scrollTop">
			<view v-for="info in renderList" :key="info.deviceNum">
				<m-device-info :info="info"></m-device-info>
			</view>
		</scroll-view>
		<view class="margin-y-2" v-else>
			<u-empty
				mode="search"
				:text="`对不起，当前区域暂无${ confrimKeywords.length > 0 ? '此' : '' }设备`"
			>
			</u-empty>
		</view>
	</view>
</template>

<script>
	const LIMIT = 20
	export default {
		props: {
			list: {
				type: Array,
				default: () =>([])
			}
		},
		data () {
			return {
				renderList: [],
				index: 0,
				keywords: "",
				confrimKeywords: "",
				scrollTop: 0
			}
		},
		methods: {
			scrolltolower () {
				// 符合条件的list
				const list = this.list.filter(one => one.deviceNum.includes(this.confrimKeywords))
				if (this.renderList.length < list.length) {
					this.index++
					this.renderList.push(...list.slice(this.index * LIMIT, (this.index + 1) * LIMIT))
				}
			},
			search (value) {
				this.confrimKeywords = value
				this.scrollTop = 0
				// 当搜索关键字 不为空时，筛选出符合条件的设备； 当搜索为空时，展示前20条数据
				if (this.confrimKeywords !== '') {
					this.index = 0
					this.renderList = this.list
											.filter(one => one.deviceNum.includes(this.confrimKeywords))
											.slice(this.index * LIMIT, (this.index + 1) * LIMIT)
				} else {
					this.index = 0
					this.renderList = this.list.slice(this.index * LIMIT, (this.index + 1) * LIMIT)
				}
			}
		},
		watch: {
			list: {
				handler (v) {
					this.keywords = this.confrimKeywords = ''
					this.scrollTop = 0
					if (v.length > LIMIT) {
						this.renderList = v.slice(0, LIMIT)
					} else {
						this.renderList = v
					}
				},
				immediate: true
			},
		}
	}
</script>

<style>
</style>