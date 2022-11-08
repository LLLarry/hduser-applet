<template>
    <view class="container">
        <!-- <input class='wolf-input' bindinput='Sendval' type='text' value='{{send_value}}' placeholder='请输入设备编号'></input>
  <button class='wolf-btn' catchtap='findDevice'>点击连接</button> -->
        <image :src="senceimg" mode="widthFix"></image>
        <button class="scanQrcode" @tap.stop.prevent="scanQrcodeConnect">扫码连接</button>
    </view>
</template>

<script>
const app = getApp();
export default {
    data() {
        return {
            senceimg: '/static/images/scansence.jpg',
            userInfo: '',
            systemInfo: '',
            systemType: 0,
            send_value: ''
        };
    }
    /**
     * 生命周期函数--监听页面加载
     */,
    onLoad: function (options) {
        console.log('onLoad');
        var that = this; //调用应用实例的方法获取全局数据

        app.globalData.getUserInfo(function (userInfo) {
            //更新数据
            that.setData({
                userInfo: userInfo
            });
        });
        that.aaa();
        uni.login({
            success: function (res) {
                console.log('获取成功' + res.ID);
            },
            fail: function (res) {},
            complete: function (res) {}
        });
        /* 初始化蓝牙适配器 */

        uni.openBluetoothAdapter({
            success: function (res) {
                console.log('初始化蓝牙适配器成功');
            }
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        var device = [];
        uni.closeBluetoothAdapter({
            success: function (res) {
                console.log('关闭蓝牙模块');
                /* 初始化蓝牙适配器 */

                uni.openBluetoothAdapter({
                    success: function (res) {
                        console.log('初始化蓝牙适配器成功');
                    }
                });
            }
        });
    },
    /* 下拉刷新页面 */
    onPullDownRefresh: function (event) {
        var that = this;
        console.log('开始下拉刷新事件');
        uni.showNavigationBarLoading(); //加载动画开始

        that.again_search();
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
    methods: {
        again_search: function () {
            var that = this;
            var device = [];
            uni.closeBluetoothAdapter({
                success: function (res) {
                    console.log('关闭蓝牙模块');
                }
            });
            /* 初始化蓝牙适配器 */

            uni.openBluetoothAdapter({
                success: function (res) {
                    console.log('初始化蓝牙适配器成功');
                    uni.stopPullDownRefresh();
                }
            });
        },

        aaa: function () {
            var that = this;
            uni.getSystemInfo({
                success: function (res) {
                    that.setData({
                        systemInfo: res
                    });
                    console.log('res===' + res);

                    if (res.platform == 'devtools') {
                        console.log('访问来源' + res.platform);
                    } else if (res.platform == 'ios') {
                        that.setData({
                            systemType: 1
                        });
                        console.log('访问来源' + res.platform);
                    } else if (res.platform == 'android') {
                        that.setData({
                            systemType: 2
                        });
                        console.log('访问来源' + res.platform);
                    }
                }
            });
        },

        /**获取输入框中的值 */
        Sendval: function (e) {
            this.setData({
                send_value: e.detail.value
            });
            console.log(this.send_value);
        },

        /**
         * 通过设备编号查询设备id（MAC）
         */
        findDevice: function () {
            var that = this;
            var sendval = that.send_value;
            uni.openBluetoothAdapter({
                success: function (res) {
                    uni.showLoading({
                        title: '正在连接'
                    });
                    uni.request({
                        url: 'https://app.tengfuchong.com/applet/findDeviceId',
                        data: {
                            code: sendval,
                            systemType: that.systemType
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                        },
                        method: 'POST',
                        success: function (res) {
                            var dataval = res.data;

                            if (dataval == 0) {
                                uni.showModal({
                                    title: '提示',
                                    content: '设备不存在',
                                    showCancel: false,
                                    success: function (res) {
                                        if (res.confirm) {
                                            console.log('用户点击确定');
                                        }
                                    }
                                });
                            } else {
                                uni.navigateTo({
                                    url: '../loading2/loading2?deviceCode=' + sendval
                                });
                            }
                        },
                        fail: function (err) {
                            console.log(err.data);
                            uni.showToast({
                                icon: 'none',
                                title: '服务器异常，清稍候再试'
                            });
                        },
                        complete: function () {
                            uni.hideLoading();
                        }
                    });
                },
                fail: function (res) {
                    console.log(res);
                }
            });
        },

        /** 扫描二维码 */
        scanQrcodeConnect: function () {
            var that = this;
            uni.scanCode({
                success: function (res) {
                    var q = res.result;
                    console.log(q);
                    var checkQrcode = q.indexOf('https://www.tengfuchong.cn/applet');

                    if (checkQrcode != -1) {
                        var urlLen = q.length;
                        var i = q.lastIndexOf('/');
                        var subq = q.substr(i + 1, 6);
                        var port = q.substr(urlLen - 1);
                        console.log('index' + i + '---截取字符串===' + subq);
                        uni.request({
                            url: 'https://app.tengfuchong.com/applet/findDeviceId',
                            data: {
                                code: subq,
                                systemType: that.systemType
                            },
                            header: {
                                'content-type': 'application/x-www-form-urlencoded' // 默认值
                            },
                            method: 'POST',
                            success: function (res) {
                                var dataval = res.data;

                                if (dataval == 0) {
                                    uni.showModal({
                                        title: '提示',
                                        content: '设备不存在',
                                        showCancel: false,
                                        success: function (res) {
                                            if (res.confirm) {
                                                console.log('用户点击确定');
                                            }
                                        }
                                    });
                                } else {
                                    uni.navigateTo({
                                        url: '../loading2/loading2?deviceCode=' + subq + '&port=' + port
                                    });
                                }
                            },
                            fail: function (err) {
                                console.log(err.data);
                                uni.showToast({
                                    icon: 'none',
                                    title: '服务器异常，清稍候再试'
                                });
                            },
                            complete: function () {
                                uni.hideLoading();
                            }
                        });
                    } else {
                        uni.showModal({
                            title: '提示',
                            content: '二维码不正确',
                            showCancel: false,
                            success: function (res) {}
                        });
                    }
                }
            });
        }
    }
};
</script>
<style>
.wolf-input {
    margin-top: 50px;
    border: 1px solid;
    height: 50px;
    width: 80%;
    text-align: center;
}
.wolf-btn {
    width: 80%;
    margin-top: 10px;
    background-color: #44b549;
}
.scanQrcode {
    width: 80%;
    margin-top: 10px;
    background-color: #44b549;
    color: white;
}
</style>
