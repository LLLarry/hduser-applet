<template>
	<view class="m-device-list padding-2 d-flex flex-column">
		<view>
			<u-search :animation="true" v-model="keywords" @search="search" @custom="search"></u-search>
		</view>
		<view class="padding-y-3 padding-x-2" v-if="loading">
			<u-skeleton
				rows="3"
				title
				loading
			></u-skeleton>
		</view>
		<view class="flex-1 d-flex flex-column overflow-hidden" v-else>
			<scroll-view class="flex-1 margin-top-2 overflow-auto" scroll-y="true" @scrolltolower="scrolltolower" v-if="detailList.length > 0" :scroll-top="scrollTop">
				<view v-for="info in detailList" :key="info.deviceNum">
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
	</view>
</template>

<script>
	const LIMIT = 20
	import { getEquipmentDate } from '@/api/home/index.js'
	export default {
		props: {
			list: {
				type: Array,
				default: () =>([])
			}
		},
		data () {
			return {
				// renderList: [],
				// index: 0,
				keywords: "",
				confrimKeywords: "",
				scrollTop: 0,
				detailList: [], // 详细的设备信息
				page: 1, // 页码
				loading: false
			}
		},
		methods: {
			
			// 获取设备详细信息
			async getDeviceDetail (data) {
				const { code, message, result = [] } = await getEquipmentDate(data)
				if (code === 200) {
					return result
				} else {
					uni.showToast({
						title: message
					})
					return Promise.reject(message)
				}
			},
			scrolltolower () {
				// 符合条件的list
				// const list = this.list.filter(one => one.deviceNum.includes(this.confrimKeywords))
				// if (this.renderList.length < list.length) {
				// 	this.index++
				// 	this.renderList.push(...list.slice(this.index * LIMIT, (this.index + 1) * LIMIT))
				// }
				this.page++
				this.asyncLoadDetail()
			},
			search (value) {
				this.confrimKeywords = value
				this.scrollTop = 0
				this.page = 1
				// 当搜索关键字 不为空时，筛选出符合条件的设备； 当搜索为空时，展示前20条数据
				// if (this.confrimKeywords !== '') {
				// 	this.index = 0
				// 	this.renderList = this.list
				// 							.filter(one => one.deviceNum.includes(this.confrimKeywords))
				// 							.slice(this.index * LIMIT, (this.index + 1) * LIMIT)
				// } else {
				// 	this.index = 0
				// 	this.renderList = this.list.slice(this.index * LIMIT, (this.index + 1) * LIMIT)
				// }
				this.asyncLoadDetail()
			},
			// 异步加载数据
			async asyncLoadDetail () {
				if (this.page === 1) {
					this.loading = true
				}
				
				try{
					const originList = this.list
						.filter(one => one.device.code.includes(this.confrimKeywords))
						.slice((this.page - 1) * LIMIT, this.page * LIMIT)
					const params = originList.map(one => one.device.code)
					const result = await this.getDeviceDetail(params)
					// 合并result和list
					const fmtResult = result.map(one => {
						const findItem = originList.find(item => item.device.code === one.deviceNum)
						return findItem ?  {...findItem.device, ...one} : one
					})
					if (this.page === 1) {
						this.detailList = fmtResult
					} else {
						this.detailList.push(...fmtResult)
					}
				}catch(e){
					//TODO handle the exception
				} finally {
					this.loading = false
				}
			},
		},
		watch: {
			list: {
				handler (v) {
					this.keywords = this.confrimKeywords = ''
					this.scrollTop = 0
					this.page = 1
					// if (v.length > LIMIT) {
					// 	this.renderList = v.slice(0, LIMIT)
					// } else {
					// 	this.renderList = v
					// }
					this.asyncLoadDetail()
				},
				immediate: true
			},
		}
	}
</script>

<style>
</style>