<template>
    <view class="container">
        <text class="connect_device_name">当前设备：{{ deviceName }}</text>
        <radio-group class="radio-group" @change="radioChange">
            <label class="radio" v-for="(item, index) in items" :key="index">
                <view>
                    <radio :value="item.name" :checked="item.checked" />
                    {{ item.value }}
                </view>
            </label>
        </radio-group>
        <button @tap="Sendincoins" class="addincoins">投币</button>
        <button @tap="Payincoins" class="payincoins">支付</button>
    </view>
</template>

<script>
const app = getApp();

var utils = require('../../utils/util');
import { authorization } from '@/api/home/index.js'
export default {
    data() {
        return {
            items: [
                {
                    name: '1',
                    value: '1元'
                },
                {
                    name: '2',
                    value: '2元',
                    checked: 'true'
                },
                {
                    name: '3',
                    value: '3元'
                },
                {
                    name: '4',
                    value: '4元'
                },
                {
                    name: '5',
                    value: '5元'
                },
                {
                    name: '6',
                    value: '6元'
                }
            ],

            subcode: '',
            deviceId: '',
            money_value: '',
            deviceName: '',
            serviceId: '',
            notycharacteristicsId: '',
            characteristicsId: '',
            recv_number: '',
            recv_value: '',
            send_number: ''
        };
    }
    /**
     * 生命周期函数--监听页面加载
     */,
    onLoad: function (options) {
        var that = this;
        console.log('index 生命周期 onload' + JSON.stringify(options)); //在此函数中获取扫描普通链接二维码参数

        let q = decodeURIComponent(options.q);

        if (q) {
            console.log('index 生命周期 onload url=' + q);
            console.log('index 生命周期 onload 参数 flag=' + utils.getQueryString(q, 'flag'));
        }

        var checkQrcode = q.indexOf('https://www.tengfuchong.cn/applet');

        if (checkQrcode != -1) {
            var i = q.lastIndexOf('/');
            var subq = q.substr(i + 1);
            console.log('index' + i + '---截取字符串===' + subq);
            this.setData({
                subcode: subq,
                deviceId: null
            });
        }

        uni.login({
            success: function (res) {
                if (res.code) {
                    uni.getUserInfo({
                        withCredentials: true,
                        success: function (res) {
                            var objz = {};
                            objz.avatarUrl = res.userInfo.avatarUrl;
                            objz.nickName = res.userInfo.nickName;
                            uni.setStorageSync('userInfo', objz); //存储userInfo
                        }
                    });
					// 获取用户openid
					authorization({
						code: res.code
					}).then(res => {
						var obj = {};
						obj.openid = res.openid; // console.log(obj);
						
						uni.setStorageSync('user', obj); //存储openid
					})
                } else {
                    // console.log('获取用户登录态失败！' + res.errMsg)
                }
            }
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;
        /* 初始化蓝牙适配器 */

        uni.openBluetoothAdapter({
            success: function (res) {
                var deviceMac = that.deviceId;
                console.log('deviceid===' + deviceMac);

                if (deviceMac != null) {
                    console.log('通过有值');
                    uni.closeBLEConnection({
                        deviceId: that.deviceId,
                        success: function (res) {
                            that.WolfConnectDevice();
                        }
                    });
                } else {
                    console.log('不通过无值');
                    that.WolfConnectDevice();
                }
            }
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},
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
    onPullDownRefresh: function () {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {},
    methods: {
        radioChange(e) {
            this.setData({
                money_value: e.detail.value
            }); // console.log('radio发生change事件，携带value值为：', e.detail.value)
        },

        WolfConnectDevice: function () {
            var that = this;
            uni.request({
                url: 'https://app.tengfuchong.com/applet/findDeviceId',
                data: {
                    code: that.subcode
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                method: 'POST',
                success: function (res) {
                    let dataval = res.data;
                    console.log('查询MAC地址===' + dataval);

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
                        that.setData({
                            deviceId: dataval,
                            deviceName: that.subcode
                        });
                        console.log('初始化蓝牙适配器成功');
                        console.log('MAC===' + dataval);
                        uni.createBLEConnection({
                            deviceId: dataval,
                            success: function (res) {
                                // console.log('连接成功', res);
                                console.log('连接deviceId', dataval);
                                uni.hideLoading();
                                uni.showToast({
                                    title: '连接成功'
                                });
                                /* 获取设备的服务UUID */

                                uni.getBLEDeviceServices({
                                    deviceId: that.deviceId,
                                    success: function (service) {
                                        var all_UUID = service.services; //取出所有的服务
                                        // console.log('所有的服务', all_UUID);

                                        var UUID_lenght = all_UUID.length; //获取到服务数组的长度

                                        /* 遍历服务数组 */

                                        for (var index = 0; index < UUID_lenght; index++) {
                                            var ergodic_UUID = all_UUID[index].uuid; //取出服务里面的UUID

                                            var UUID_slice = ergodic_UUID.slice(4, 8); //截取4到8位

                                            /* 判断是否是我们需要的FEE0 */
                                            // console.log('uuid长度' + UUID_slice);
                                            // console.log('uuid判别' + (UUID_slice == 'FEE0' || UUID_slice == 'ffe0'));

                                            if (UUID_slice == 'FFE0' || UUID_slice == 'ffe0') {
                                                var index_uuid = index;
                                                that.setData({
                                                    serviceId: all_UUID[index_uuid].uuid //确定需要的服务UUID
                                                }); // console.log('uuid' + all_UUID[index_uuid].uuid)
                                            }
                                        } // console.log('连接deviceId', that.data.deviceId);

                                        that.Characteristics(); //调用获取特征值函数
                                    }
                                });
                            },
                            fail: function (res) {
                                console.log('res===' + res.errMsg);
                                uni.hideLoading();

                                if (res.errMsg.indexOf('already connect') != -1) {
                                    uni.closeBLEConnection({
                                        deviceId: that.deviceId,
                                        success: function (res) {
                                            that.WolfConnectDevice();
                                        }
                                    });
                                } else {
                                    uni.showModal({
                                        title: '提示',
                                        content: '连接失败，请确认设备是否在线',
                                        showCancel: false,
                                        success: function (res) {
                                            if (res.confirm) {
                                                uni.switchTab({
                                                    url: '../device/device'
                                                });
                                            }
                                        }
                                    });
                                }
                            }
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

        Characteristics: function () {
            var that = this; // console.log('this===' + that);

            var device_characteristics = [];
            var characteristics_uuid = {};
            uni.getBLEDeviceCharacteristics({
                deviceId: that.deviceId,
                serviceId: that.serviceId,
                success: function (res) {
                    var characteristics = res.characteristics; //获取到所有特征值

                    var characteristics_length = characteristics.length; //获取到特征值数组的长度
                    // console.log('获取到特征值', characteristics);
                    // console.log('获取到特征值数组长度', characteristics_length);

                    /* 遍历数组获取notycharacteristicsId */

                    for (var index = 0; index < characteristics_length; index++) {
                        var noty_characteristics_UUID = characteristics[index].uuid; //取出特征值里面的UUID

                        var characteristics_slice = noty_characteristics_UUID.slice(4, 8); //截取4到8位

                        /* 判断是否是我们需要的FEE1 */

                        if (characteristics_slice == 'FFE1' || characteristics_slice == 'ffe1') {
                            var index_uuid = index;
                            that.setData({
                                notycharacteristicsId: characteristics[index_uuid].uuid,
                                //需确定要的使能UUID
                                characteristicsId: characteristics[index_uuid].uuid //暂时确定的写入UUID
                            });
                            /* 遍历获取characteristicsId */

                            for (var index = 0; index < characteristics_length; index++) {
                                var characteristics_UUID = characteristics[index].uuid; //取出特征值里面的UUID

                                var characteristics_slice = characteristics_UUID.slice(4, 8); //截取4到8位

                                /* 判断是否是我们需要的FEE2 */

                                if (characteristics_slice == 'FEE2' || characteristics_slice == 'fee2') {
                                    var index_uuid = index;
                                    that.setData({
                                        characteristicsId: characteristics[index_uuid].uuid //确定的写入UUID
                                    });
                                }
                            }
                        }
                    } // console.log('使能characteristicsId', that.data.notycharacteristicsId);

                    // console.log('写入characteristicsId', that.data.characteristicsId);

                    that.notycharacteristicsIdFun(); //使能事件
                }
            });
        },

        /* 使能函数 */
        notycharacteristicsIdFun: function () {
            var that = this;
            var recv_value_ascii = '';
            var string_value = '';
            var recve_value = '';
            uni.notifyBLECharacteristicValueChange({
                deviceId: that.deviceId,
                serviceId: that.serviceId,
                characteristicId: that.notycharacteristicsId,
                state: true,
                success: function (res) {
                    // console.log('使能成功', res);

                    /* 设备返回值 */
                    uni.onBLECharacteristicValueChange(function (res) {
                        var length_hex = [];
                        var turn_back = '';
                        var turn_back_hex = '';
                        var result = res.value;
                        var hex = that.buf2hex(result); // console.log('返回的值', hex);
                        // console.log('设备返回来的值', hex);

                        var f_hex = hex;
                        var length_soy = f_hex.length / 2;
                        var length = Math.round(length_soy);

                        for (var i = 0; i < length; i++) {
                            var hex_spalit = f_hex.slice(0, 2);
                            length_hex.push(hex_spalit);
                            f_hex = f_hex.substring(2);
                        } // console.log('length_hex', length_hex);

                        for (var j = 0; j < length_hex.length; j++) {
                            var integar = length_hex[j]; //十六进制

                            recve_value = parseInt(integar, 16); //十进制
                            // console.log('recve_value', recve_value);

                            turn_back = turn_back + String.fromCharCode(recve_value);
                            turn_back_hex = turn_back_hex + integar; // console.log('turn_back', integar);
                        } // console.log('返回值hex' + turn_back_hex);

                        if (turn_back_hex == '5504830100d2') {
                            uni.hideLoading();
                            uni.showToast({
                                title: '投币成功'
                            });
                        } // console.log('最终转回来的值', turn_back);

                        var recv_number_1 = that.recv_number + turn_back.length;
                        var recv_number = Math.round(recv_number_1);
                        that.setData({
                            recv_number: recv_number,
                            recv_value: that.recv_value + turn_back
                        });
                    });
                },
                fail: function (res) {
                    // console.log('使能失败', res);
                }
            });
        },

        Sendincoins: function () {
            var that = this;
            uni.openBluetoothAdapter({
                success: function (res) {
                    var send1 = 'aa';
                    var send2 = '83';
                    var send3 = '04';
                    var send4 = '01';
                    var send5 = '01';
                    var send6 = that.money_value || '02';
                    var valSize = send6.length;

                    if (valSize < 2 && valSize > 0) {
                        send6 = '0' + send6;
                    }

                    var send7 = send2 ^ send3 ^ send4 ^ send5 ^ send6; // console.log("拼凑值===" + send1 + '' + send2 + '' + send3 + '' + send4 + '' + send5 + '' + send6 + '' + send7)
                    // var value_initial = 'aa830401010186';

                    var value_initial = send1 + '' + send2 + '' + send3 + '' + send4 + '' + send5 + '' + send6 + '' + send7;
                    /* 判断字节是否超过20字节 */

                    if (value_initial.length > 20) {
                        //当字节超过20的时候，采用分段发送
                        if (that.send_string == true) {
                            //选择16进制发送时
                            var value_initial_exceed = value_initial; //将输入框的值取过来，方便循环

                            var value_initial_average = Math.ceil(value_initial_exceed.length / 20); //将value_initial_exceed的长度除以20，余数再向上取一，确定循环几次
                            // console.log('需要循环的次数', value_initial_average);

                            for (var i = 0; i < value_initial_average; i++) {
                                if (value_initial_exceed.length > 20) {
                                    var value_initial_send = value_initial_exceed.slice(0, 20); //截取前20个字节
                                    // console.log('截取到的值', value_initial_send);

                                    value_initial_exceed = value_initial_exceed.substring(20); //value_initial_exceed替换为取掉前20字节后的数据

                                    write_array.push(value_initial_send); //将所有截取的值放在一个数组
                                } else {
                                    write_array.push(value_initial_exceed);
                                }
                            } // console.log('write_array数组', write_array);

                            write_array.map(function (val, index) {
                                setTimeout(function () {
                                    var value_set = val; // console.log('value_set', value_set);

                                    var write_function = that.write(value_set); //调用数据发送函数
                                }, index * 100);
                            });
                            /* 发送的值的字节 */

                            var send_number_1 = that.send_number + value_initial.length / 2;
                            var send_number = Math.floor(send_number_1);
                            that.setData({
                                send_number: send_number
                            });
                        } else {
                            //选择Ascii码发送

                            /* 当选择以Ascii字符发送的时候 */
                            var value_split = value_initial.split(''); //将字符一个一个分开
                            // console.log('value_split', value_split);

                            for (var i = 0; i < value_split.length; i++) {
                                value_ascii = value_ascii + value_split[i].charCodeAt().toString(16); //转为Ascii字符后连接起
                            }

                            var Ascii_value = value_ascii; // console.log('转为Ascii码值', Ascii_value);
                            // console.log('Ascii_value的长度', Ascii_value.length)

                            var Ascii_send_time = Math.ceil(Ascii_value.length / 20); // console.log('Ascii发送的次数', Ascii_send_time);

                            for (var i = 0; i < Ascii_send_time; i++) {
                                if (Ascii_value.length > 20) {
                                    var value = Ascii_value.slice(0, 20); // console.log('截取到的值', value);

                                    Ascii_value = Ascii_value.substring(20); // console.log('此时剩下的Ascii_value', Ascii_value);

                                    write_array.push(value); //放在数组里面
                                } else {
                                    var value = Ascii_value;
                                    write_array.push(Ascii_value); //放在数组里面
                                }
                            } // console.log('数组write_array', write_array);

                            write_array.map(function (val, index) {
                                setTimeout(function () {
                                    var value_set = val; // console.log('value_set', value_set);

                                    var write_function = that.write(value_set); //调用数据发送函数
                                }, index * 100);
                            });
                            /* 发送的值的字节 */

                            var send_number_1 = that.send_number + value_initial.length;
                            var send_number = Math.round(send_number_1);
                            that.setData({
                                send_number: send_number
                            });
                        }
                    } else {
                        /* 当选择了以Hex十六进制发送的时候 */
                        var value = value_initial;
                        var write_function = that.write(value); //调用数据发送函数

                        /* 成功发送的值的字节 */

                        var send_number_1 = that.send_number + value_initial.length / 2;
                        var send_number = Math.floor(send_number_1);
                        that.setData({
                            send_number: send_number
                        });
                    }
                },
                fail: function (res) {
                    uni.showModal({
                        content: '请开启手机蓝牙后再试',
                        success: function () {
                            uni.switchTab({
                                url: '../device/device',
                                success: function () {
                                    // console.log("success");
                                },
                                fail: function (res) {
                                    // console.log("fail" + res);
                                }
                            });
                        }
                    });
                }
            });
        },

        write: function (str) {
            var that = this;
            var value = str; // console.log('value', value);

            var valSize = value.length;

            if (valSize < 2 && valSize > 0) {
                value = '0' + value;
            }
            /* 将数值转为ArrayBuffer类型数据 */

            var typedArray = new Uint8Array(
                (value + '\r\n').match(/[\da-f]{2}/gi).map(function (h) {
                    return parseInt(h, 16);
                })
            );
            var buffer = typedArray.buffer;
            uni.writeBLECharacteristicValue({
                deviceId: that.deviceId,
                serviceId: that.serviceId,
                characteristicId: that.characteristicsId,
                value: buffer,
                success: function (res) {
                    console.log('数据发送成功', res);
                },
                fail: function (res) {
                    // console.log('调用失败', res);

                    /* 调用失败时，再次调用 */
                    uni.writeBLECharacteristicValue({
                        deviceId: that.deviceId,
                        serviceId: that.serviceId,
                        characteristicId: that.characteristicsId,
                        value: buffer,
                        success: function (res) {
                            // console.log('第2次数据发送成功', res);
                        },
                        fail: function (res) {
                            console.log('第2次调用失败', res);
                            /* 调用失败时，再次调用 */

                            uni.writeBLECharacteristicValue({
                                deviceId: that.deviceId,
                                serviceId: that.serviceId,
                                characteristicId: that.characteristicsId,
                                value: buffer,
                                success: function (res) {
                                    // console.log('第3次数据发送成功', res);
                                },
                                fail: function (res) {
                                    // wx.showToast({
                                    //   title: '设备不在线或距离较远',
                                    //   success: function() {
                                    //     wx.switchTab({
                                    //       url: '../device/device',
                                    //     });
                                    //   }
                                    // })
                                    uni.showModal({
                                        title: '提示',
                                        content: '设备不在线或距离较远',
                                        showCancel: false,
                                        success: function (res) {
                                            if (res.confirm) {
                                                uni.switchTab({
                                                    url: '../device/device'
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },

        Payincoins: function () {
            var that = this;
            uni.openBluetoothAdapter({
                success: function (res) {
                    var openid = '';
                    var user = uni.getStorageSync('user') || {};
                    uni.request({
                        url: 'https://app.tengfuchong.com/testpay/pay',
                        data: {
                            openId: user.openid,
                            money: that.money_value || 2
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                        },
                        method: 'POST',
                        success: function (res) {
                            that.doWxPay(res.data);
                        },
                        fail: function (err) {
                            uni.showToast({
                                icon: 'none',
                                title: '服务器异常，清稍候再试'
                            });
                        }
                    });
                },
                fail: function () {
                    uni.showModal({
                        content: '请开启手机蓝牙后再试',
                        success: function () {
                            uni.switchTab({
                                url: '../device/device',
                                success: function () {},
                                fail: function (res) {}
                            });
                        }
                    });
                }
            });
        },

        doWxPay(param) {
            var that = this; //小程序发起微信支付

            uni.requestPayment({
                timeStamp: param.timeStamp,
                //记住，这边的timeStamp一定要是字符串类型的，不然会报错
                nonceStr: param.nonceStr,
                package: param.packagess,
                signType: 'MD5',
                paySign: param.paySign,
                success: function (event) {
                    // success
                    that.senddata();
                    uni.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 2000
                    });
                },
                fail: function (error) {},
                complete: function () {}
            });
        },

        checkBluetoothIfOpen: function () {
            uni.openBluetoothAdapter({
                success: function (res) {},
                fail: function (res) {
                    uni.showModal({
                        content: '请开启手机蓝牙后再试'
                    });
                    uni.navigateTo({
                        url: '../device/device'
                    });
                }
            });
        },

        senddata() {
            var that = this;
            var send1 = 'aa';
            var send2 = '83';
            var send3 = '04';
            var send4 = '01';
            var send5 = '01';
            var send6 = that.money_value || '02';
            var valSize = send6.length;

            if (valSize < 2 && valSize > 0) {
                send6 = '0' + send6;
            }

            var send7 = send2 ^ send3 ^ send4 ^ send5 ^ send6; // var value_initial = 'aa830401010186';

            var value_initial = send1 + '' + send2 + '' + send3 + '' + send4 + '' + send5 + '' + send6 + '' + send7;
            /* 判断字节是否超过20字节 */

            if (value_initial.length > 20) {
                //当字节超过20的时候，采用分段发送
                if (that.send_string == true) {
                    //选择16进制发送时
                    var value_initial_exceed = value_initial; //将输入框的值取过来，方便循环

                    var value_initial_average = Math.ceil(value_initial_exceed.length / 20); //将value_initial_exceed的长度除以20，余数再向上取一，确定循环几次
                    // console.log('需要循环的次数', value_initial_average);

                    for (var i = 0; i < value_initial_average; i++) {
                        if (value_initial_exceed.length > 20) {
                            var value_initial_send = value_initial_exceed.slice(0, 20); //截取前20个字节
                            // console.log('截取到的值', value_initial_send);

                            value_initial_exceed = value_initial_exceed.substring(20); //value_initial_exceed替换为取掉前20字节后的数据

                            write_array.push(value_initial_send); //将所有截取的值放在一个数组
                        } else {
                            write_array.push(value_initial_exceed);
                        }
                    } // console.log('write_array数组', write_array);

                    write_array.map(function (val, index) {
                        setTimeout(function () {
                            var value_set = val; // console.log('value_set', value_set);

                            var write_function = that.write(value_set); //调用数据发送函数
                        }, index * 100);
                    });
                    /* 发送的值的字节 */

                    var send_number_1 = that.send_number + value_initial.length / 2;
                    var send_number = Math.floor(send_number_1);
                    that.setData({
                        send_number: send_number
                    });
                } else {
                    //选择Ascii码发送

                    /* 当选择以Ascii字符发送的时候 */
                    var value_split = value_initial.split(''); //将字符一个一个分开
                    // console.log('value_split', value_split);

                    for (var i = 0; i < value_split.length; i++) {
                        value_ascii = value_ascii + value_split[i].charCodeAt().toString(16); //转为Ascii字符后连接起
                    }

                    var Ascii_value = value_ascii; // console.log('转为Ascii码值', Ascii_value);
                    // console.log('Ascii_value的长度', Ascii_value.length)

                    var Ascii_send_time = Math.ceil(Ascii_value.length / 20); // console.log('Ascii发送的次数', Ascii_send_time);

                    for (var i = 0; i < Ascii_send_time; i++) {
                        if (Ascii_value.length > 20) {
                            var value = Ascii_value.slice(0, 20); // console.log('截取到的值', value);

                            Ascii_value = Ascii_value.substring(20); // console.log('此时剩下的Ascii_value', Ascii_value);

                            write_array.push(value); //放在数组里面
                        } else {
                            var value = Ascii_value;
                            write_array.push(Ascii_value); //放在数组里面
                        }
                    } // console.log('数组write_array', write_array);

                    write_array.map(function (val, index) {
                        setTimeout(function () {
                            var value_set = val; // console.log('value_set', value_set);

                            var write_function = that.write(value_set); //调用数据发送函数
                        }, index * 100);
                    });
                    /* 发送的值的字节 */

                    var send_number_1 = that.send_number + value_initial.length;
                    var send_number = Math.round(send_number_1);
                    that.setData({
                        send_number: send_number
                    });
                }
            } else {
                /* 当选择了以Hex十六进制发送的时候 */
                var value = value_initial;
                var write_function = that.write(value); //调用数据发送函数

                /* 成功发送的值的字节 */

                var send_number_1 = that.send_number + value_initial.length / 2;
                var send_number = Math.floor(send_number_1);
                that.setData({
                    send_number: send_number
                });
            }
        },

        buf2hex: function (buffer) {
            // buffer is an ArrayBuffer
            return Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('');
        },

        base64_encode: function (str) {
            var c1;
            var c2;
            var c3;
            // 编码，配合encodeURIComponent使用
            var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            var i = 0;
            var len = str.length;
            var strin = '';
            while (i < len) {
                c1 = str.charCodeAt(i++) & 255;

                if (i == len) {
                    strin += base64EncodeChars.charAt(c1 >> 2);
                    strin += base64EncodeChars.charAt((c1 & 3) << 4);
                    strin += '==';
                    break;
                }

                c2 = str.charCodeAt(i++);

                if (i == len) {
                    strin += base64EncodeChars.charAt(c1 >> 2);
                    strin += base64EncodeChars.charAt(((c1 & 3) << 4) | ((c2 & 240) >> 4));
                    strin += base64EncodeChars.charAt((c2 & 15) << 2);
                    strin += '=';
                    break;
                }

                c3 = str.charCodeAt(i++);
                strin += base64EncodeChars.charAt(c1 >> 2);
                strin += base64EncodeChars.charAt(((c1 & 3) << 4) | ((c2 & 240) >> 4));
                strin += base64EncodeChars.charAt(((c2 & 15) << 2) | ((c3 & 192) >> 6));
                strin += base64EncodeChars.charAt(c3 & 63);
            }

            return strin;
        }
    }
};
</script>
<style>
.addincoins {
    width: 100%;
    background-color: #1eff00;
}
.payincoins {
    margin-top: 5px;
    width: 100%;
    background-color: #1eff00;
}
.money {
    width: 100%;
}
.item {
    font-family: PingFangSC-Medium;
    font-size: 26rpx;
    line-height: 20rpx;
}
</style>
