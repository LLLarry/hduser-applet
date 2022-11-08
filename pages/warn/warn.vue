<template>
    <view class="container">
        <icon type="warn" size="45" color="orange"></icon>
        <text style="margin: 5px">系统识别您未打开蓝牙，请打开蓝牙</text>
        <button class="scan" @tap.stop.prevent="scanQrcodeConnect">重新扫码</button>
    </view>
</template>

<script>
const app = getApp();
export default {
    data() {
        return {
            senceimg: '/static/image/scansence.jpg',
            userInfo: '',
            systemInfo: '',
            systemType: 0
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
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},
    /* 下拉刷新页面 */
    onPullDownRefresh: function (event) {},
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

        /** 扫描二维码 */
        scanQrcodeConnect: function () {
            var that = this;
            uni.openBluetoothAdapter({
                success: function (res) {
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
                                            uni.redirectTo({
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
                },
                fail: function () {
                    uni.showModal({
                        title: '提示',
                        content: '系统检测到未打开蓝牙'
                    });
                }
            });
        }
    }
};
</script>
<style>
.scan {
    width: 80%;
    margin-top: 10px;
    background-color: #44b549;
}
</style>
