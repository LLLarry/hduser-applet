<template>
    <view class="container">
        <view id="loading" v-if="!loadingHidden">
            <view id="loading-center">
                <view id="textview">正在连接蓝牙设备</view>
                <view id="loading-center-absolute">
                    <view class="object" id="object_one"></view>
                    <view class="object" id="object_two"></view>
                    <view class="object" id="object_three"></view>
                    <view class="object" id="object_four"></view>
                    <view class="object" id="object_five"></view>
                    <view class="object" id="object_six"></view>
                    <view class="object" id="object_seven"></view>
                    <view class="object" id="object_eight"></view>
                    <view class="object" id="object_big"></view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
const app = getApp();

var utils = require('@/utils/util');

export default {
    data() {
        return {
            loadingHidden: true,
            subq: '',
            port: '',
            systemInfo: '',
            systemType: 0
        };
    }
    /**
     * 生命周期函数--监听页面加载
     */,
    onLoad: function (options) {
        this.setData({
            loadingHidden: false
        });
        var that = this;
        console.log('index 生命周期 onload' + JSON.stringify(options)); //在此函数中获取扫描普通链接二维码参数

        let q = decodeURIComponent(options.q);

        if (q) {
            console.log('index 生命周期 onload url=' + q);
            console.log('index 生命周期 onload 参数 flag=' + utils.getQueryString(q, 'flag'));
        }

        var urlLen = q.length;
        var checkQrcode = q.indexOf('https://www.tengfuchong.cn/applet');

        if (checkQrcode != -1) {
            var i = q.lastIndexOf('/');
            var subq = q.substr(i + 1, 6);
            var port = q.substr(urlLen - 1);
            console.log('index' + i + '---截取字符串===' + subq);
            console.log('端口号===' + port);
            that.setData({
                subq: subq,
                port: port
            });
            that.aaa();
        }
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
        uni.stopBluetoothDevicesDiscovery({
            success: function (res) {
				console.log('stopBluetoothDevicesDiscovery', res)
			},
			fail(err) {
				console.log('stopBluetoothDevicesDiscovery', err)
			}
        });
        uni.closeBluetoothAdapter({
            success: function (res) {}
        });
        uni.request({
            url: 'https://app.tengfuchong.com/applet/findDeviceId',
            data: {
                code: that.subq,
                systemType: that.systemType
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            method: 'POST',
            success: function (res) {
                var dataval = res.data.deviceid;
                var merid = 0;
                merid = res.data.merid;
				// 初始化蓝牙模块
                uni.openBluetoothAdapter({
                    success: function (res) {
                        console.log('初始化蓝牙适配器成功');
						// 开始搜寻附近的蓝牙外围设备
                        uni.startBluetoothDevicesDiscovery({
                            services: ['FFE0'],
                            allowDuplicatesKey: false,
                            success: function (res) {
                                console.log('这里是开始搜索附近设备', res);
								// 监听寻找新设备事件
                                uni.onBluetoothDeviceFound(function (res) {
                                    console.log('监听寻找新设备事件-成功', res); // if (res.devices[0].name.indexOf('JDY-08') != -1) {

                                    if (res.devices[0].name != undefined && (res.devices[0].name.indexOf('HD-' + that.subq) != -1 || res.devices[0].name.indexOf('JDY-08') != -1)) {
                                        var sysType = that.systemType;

                                        if (sysType == 1) {
                                            dataval = res.devices[0].deviceId;
                                        }

                                        uni.request({
                                            url: 'https://app.tengfuchong.com/applet/queryCodeBindPhone?code=' + that.subq,
                                            success: function (res) {
                                                uni.redirectTo({
                                                    url:
                                                        '../incoins/incoins?id=' +
                                                        dataval +
                                                        '&name=' +
                                                        that.subq +
                                                        '&port=' +
                                                        that.port +
                                                        '&phonenum=' +
                                                        res.data +
                                                        '&merid=' +
                                                        merid
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    },
                    fail: function () {
                        uni.closeBluetoothAdapter({
                            success: function (res) {
                                uni.redirectTo({
                                    url: '../warn/warn'
                                });
                            }
                        });
                    }
                });
            },
            fail: function () {
                console.log('服务器异常');
            }
        });
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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        uni.stopBluetoothDevicesDiscovery({
            success: function (res) {}
        });
        uni.closeBluetoothAdapter({
            success: function (res) {}
        });
        this.loadBletooth();
    },
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

        loadBletooth: function () {
            var that = this;
            uni.request({
                url: 'https://app.tengfuchong.com/applet/findDeviceId',
                data: {
                    code: that.subq,
                    systemType: that.systemType
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                method: 'POST',
                success: function (res) {
                    var dataval = res.data;
                    uni.openBluetoothAdapter({
                        success: function (res) {
                            console.log('初始化蓝牙适配器成功');
                            uni.startBluetoothDevicesDiscovery({
                                services: [],
                                allowDuplicatesKey: false,
                                success: function (res) {
                                    console.log('这里是开始搜索附近设备', res);
                                    uni.onBluetoothDeviceFound(function (res) {
                                        console.log('成功', res);

                                        if (
                                            res.devices[0].name != undefined &&
                                            (res.devices[0].name.indexOf('HD-' + that.subq) != -1 || res.devices[0].name.indexOf('JDY-08') != -1)
                                        ) {
                                            // if (res.devices[0].name.indexOf('JDY-08') != -1) {
                                            uni.stopPullDownRefresh();
                                            uni.request({
                                                url: 'https://app.tengfuchong.com/applet/queryCodeBindPhone?code=' + that.subq,
                                                success: function (res) {
                                                    uni.redirectTo({
                                                        url: '../incoins/incoins?id=' + dataval + '&name=' + that.subq + '&port=' + that.port + '&phonenum=' + res.data
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        },
                        fail: function () {
                            uni.closeBluetoothAdapter({
                                success: function (res) {
                                    uni.redirectTo({
                                        url: '../warn/warn'
                                    });
                                }
                            });
                        }
                    });
                },
                fail: function () {
                    console.log('服务器异常');
                }
            });
        }
    }
};
</script>
<style>
#loading {
    background-color: #db9e36;
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 1;
    margin-top: 0px;
    top: 0px;
}
#textview {
    text-align: center;
}
#loading-center {
    width: 100%;
    height: 100%;
    position: relative;
}
#loading-center-absolute {
    position: absolute;
    left: 50%;
    top: 50%;
    height: 150px;
    width: 150px;
    margin-top: -75px;
    margin-left: -75px;
    -ms-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
}
.object {
    width: 20px;
    height: 20px;
    background-color: #fff;
    position: absolute;
    left: 65px;
    top: 65px;
}
.object:nth-child(2n + 0) {
    margin-right: 0px;
}
#object_one {
    -webkit-animation: object_one 2s infinite;
    animation: object_one 2s infinite;
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
}
#object_two {
    -webkit-animation: object_two 2s infinite;
    animation: object_two 2s infinite;
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
}
#object_three {
    -webkit-animation: object_three 2s infinite;
    animation: object_three 2s infinite;
    -webkit-animation-delay: 0.4s;
    animation-delay: 0.4s;
}
#object_four {
    -webkit-animation: object_four 2s infinite;
    animation: object_four 2s infinite;
    -webkit-animation-delay: 0.5s;
    animation-delay: 0.5s;
}
#object_five {
    -webkit-animation: object_five 2s infinite;
    animation: object_five 2s infinite;
    -webkit-animation-delay: 0.6s;
    animation-delay: 0.6s;
}
#object_six {
    -webkit-animation: object_six 2s infinite;
    animation: object_six 2s infinite;
    -webkit-animation-delay: 0.7s;
    animation-delay: 0.7s;
}
#object_seven {
    -webkit-animation: object_seven 2s infinite;
    animation: object_seven 2s infinite;
    -webkit-animation-delay: 0.8s;
    animation-delay: 0.8s;
}
#object_eight {
    -webkit-animation: object_eight 2s infinite;
    animation: object_eight 2s infinite;
    -webkit-animation-delay: 0.9s;
    animation-delay: 0.9s;
}
#object_big {
    position: absolute;
    width: 50px;
    height: 50px;
    left: 50px;
    top: 50px;
    -webkit-animation: object_big 2s infinite;
    animation: object_big 2s infinite;
    -webkit-animation-delay: 0.5s;
    animation-delay: 0.5s;
}
@-webkit-keyframes object_big {
    50% {
        -webkit-transform: scale(0.5);
    }
}
@keyframes object_big {
    50% {
        transform: scale(0.5);
        -webkit-transform: scale(0.5);
    }
}
@-webkit-keyframes object_one {
    50% {
        -webkit-transform: translate(-65px, -65px);
    }
}
@keyframes object_one {
    50% {
        transform: translate(-65px, -65px);
        -webkit-transform: translate(-65px, -65px);
    }
}
@-webkit-keyframes object_two {
    50% {
        -webkit-transform: translate(0, -65px);
    }
}
@keyframes object_two {
    50% {
        transform: translate(0, -65px);
        -webkit-transform: translate(0, -65px);
    }
}
@-webkit-keyframes object_three {
    50% {
        -webkit-transform: translate(65px, -65px);
    }
}
@keyframes object_three {
    50% {
        transform: translate(65px, -65px);
        -webkit-transform: translate(65px, -65px);
    }
}
@-webkit-keyframes object_four {
    50% {
        -webkit-transform: translate(65px, 0);
    }
}
@keyframes object_four {
    50% {
        transform: translate(65px, 0);
        -webkit-transform: translate(65px, 0);
    }
}
@-webkit-keyframes object_five {
    50% {
        -webkit-transform: translate(65px, 65px);
    }
}
@keyframes object_five {
    50% {
        transform: translate(65px, 65px);
        -webkit-transform: translate(65px, 65px);
    }
}
@-webkit-keyframes object_six {
    50% {
        -webkit-transform: translate(0, 65px);
    }
}
@keyframes object_six {
    50% {
        transform: translate(0, 65px);
        -webkit-transform: translate(0, 65px);
    }
}
@-webkit-keyframes object_seven {
    50% {
        -webkit-transform: translate(-65px, 65px);
    }
}
@keyframes object_seven {
    50% {
        transform: translate(-65px, 65px);
        -webkit-transform: translate(-65px, 65px);
    }
}
@-webkit-keyframes object_eight {
    50% {
        -webkit-transform: translate(-65px, 0);
    }
}
@keyframes object_eight {
    50% {
        transform: translate(-65px, 0);
        -webkit-transform: translate(-65px, 0);
    }
}
</style>
