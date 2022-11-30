<template>
  <view class="container">
    <view class="ad">
      <navigator>
        <image class="adimg" :src="adimg" mode="widthFix"></image>
      </navigator>
    </view>
    <text class="connect_device_name">当前设备：{{ deviceName }}</text>
    <view class="choosemoney">
      <view class="title">请选择投币方式</view>
      <view class="tr" v-for="(item, index) in items" :key="index">
        <view
          :class="'btn ' + (val == item.money ? 'active' : '')"
          @tap.stop.prevent="handle"
          :data-id="item.id"
          :data-value="item.remark"
          :data-money="item.money"
        >
          {{ item.name }}
        </view>
      </view>
    </view>
    <button
      v-if="merid == 0"
      @tap="Sendincoins"
      class="addincoins"
      size="large"
      :disabled="disabled"
    >
      模拟投币
    </button>
    <button
      v-if="merid != 0"
      @tap="Payincoins"
      class="payincoins"
      size="large"
      :disabled="disabled"
    >
      确认支付
    </button>
    <button @tap="Backhome" class="payincoins goIndex" size="large">
      回到首页
    </button>
    <view @tap="callPhone" id="connect_phone" style="width: 100%">
      联系商家：
      <text>{{ phonenum }}</text>
    </view>
  </view>
</template>

<script>
const app = getApp();
export default {
  data() {
    return {
      items: [
        {
          name: "1元",
          money: "1",
          remark: "1",
        },
        {
          name: "2元",
          money: "2",
          remark: "2",
        },
        {
          name: "3元",
          money: "3",
          remark: "3",
        },
        {
          name: "4元",
          money: "4",
          remark: "4",
        },
        {
          name: "5元",
          money: "5",
          remark: "5",
        },
        {
          name: "6元",
          money: "6",
          remark: "6",
        },
      ],

      val: 2,
      money_value: 2,
      openid: null,
      merid: 0,
      phonenum: "4006315515",
      disabled: false,
      deviceId: "",
      deviceName: "",
      port: "",
      adimg: "",
      serviceId: "",
      tempid: "",
      notycharacteristicsId: "",
      characteristicsId: "",
      recv_number: "",
      recv_value: "",
      send_number: "",
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */ onLoad: function (options) {
    var that = this;
    this.getTemp(options.name);
    this.setData({
      deviceId: options.id,
      deviceName: options.name,
      port: options.port,
      adimg: "/static/images/ad1.png",
      phonenum: options.phonenum,
      merid: options.merid,
      openid:
        app.globalData.user && app.globalData.user.openid
          ? app.globalData.user.openid
          : "",
    });
    uni.stopBluetoothDevicesDiscovery({
      success: function (res) {},
    });
    uni.login({
      success: function (res) {
        if (res.code) {
          uni.getUserInfo({
            withCredentials: true,
            success: function (res) {
              var objz = {};
              objz.avatarUrl = res.userInfo.avatarUrl;
              objz.nickName = res.userInfo.nickName;
              uni.setStorageSync("userInfo", objz); //存储userInfo
            },
          });

          uni.request({
            url:
              "https://app.tengfuchong.com/applet/getWxUserInfo?code=" +
              res.code,
            success: function (res) {
              const result = res.data;
              if (result.code === 200) {
                that.setData({
                  openid: result.openid,
                });
              } else {
                uni.showModal({
                  title: "提示",
                  content: result.message || "未获取到用户",
                  success: function (res) {
                    uni.switchTab({
                      url: "/pages/device/device",
                    });
                  },
                });
              }
            },
            fail(err) {
              console.log("error", err);
              uni.showModal({
                title: "提示",
                content: JSON.stringify(err),
                success: function (res) {
                  uni.switchTab({
                    url: "/pages/device/device",
                  });
                },
              });
            },
          });
        }
      },
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
        console.log("初始化蓝牙适配器成功");
        console.log("MAC===" + that.deviceId);
        /* 开始连接蓝牙设备 */

        uni.showLoading({
          title: "连接中...",
          mask: true,
        });
        uni.createBLEConnection({
          deviceId: that.deviceId,
          success: function (res) {
            // console.log('连接成功', res);
            console.log("连接deviceId", that.deviceId);
            uni.hideLoading();
            uni.showToast({
              title: "连接成功",
              duration: 1000,
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

                  if (UUID_slice == "FFE0" || UUID_slice == "ffe0") {
                    var index_uuid = index;
                    that.setData({
                      serviceId: all_UUID[index_uuid].uuid, //确定需要的服务UUID
                    }); // console.log('uuid' + all_UUID[index_uuid].uuid)
                  }
                } // console.log('连接deviceId', that.data.deviceId);

                that.Characteristics(); //调用获取特征值函数
              },
            });
          },
          fail: function (res) {
            console.log("res===" + res.errMsg);
            uni.hideLoading();
            uni.showModal({
              title: "提示",
              content: "连接失败，请确认设备是否在线",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  uni.switchTab({
                    url: "../device/device",
                  });
                }
              },
            });
          },
        });
      },
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // wx.closeBLEConnection({
    //   deviceId: this.data.deviceId,
    //   success: function(res) {
    //     wx.switchTab({
    //       url: '../device/device',
    //     });
    //   },
    // })
  },
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
    handle(e) {
      this.setData({
        val: e.target.dataset.money,
        money_value: e.target.dataset.value,
        tempid: e.target.dataset.id,
      });
    },

    /**
     * 获取设备相对应的模板
     */
    getTemp: function (code) {
      var that = this;
      console.log("设备号===" + code);
      uni.request({
        url: "https://app.tengfuchong.com/applet/getTemps?code=" + code,
        method: "POST",
        success: function (res) {
          console.log(res.data);

          if (res.data.length == 0) {
            that.setData({
              money_value: 2,
              val: 2,
            });
          }

          if (res.data.length == 1) {
            that.setData({
              items: res.data,
              money_value: res.data[0].remark,
              val: res.data[0].money,
              tempid: res.data[0].id,
            });
          } else {
            for (var index in res.data) {
              console.log(index + "=" + res.data[index].name);
              that.setData({
                items: res.data,
                money_value: res.data[1].remark,
                val: res.data[1].money,
                tempid: res.data[1].id,
              });
            }
          }
        },
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

            if (
              characteristics_slice == "FFE1" ||
              characteristics_slice == "ffe1"
            ) {
              var index_uuid = index;
              that.setData({
                notycharacteristicsId: characteristics[index_uuid].uuid,
                //需确定要的使能UUID
                characteristicsId: characteristics[index_uuid].uuid, //暂时确定的写入UUID
              });
              /* 遍历获取characteristicsId */

              for (var index = 0; index < characteristics_length; index++) {
                var characteristics_UUID = characteristics[index].uuid; //取出特征值里面的UUID

                var characteristics_slice = characteristics_UUID.slice(4, 8); //截取4到8位

                /* 判断是否是我们需要的FEE2 */

                if (
                  characteristics_slice == "FEE2" ||
                  characteristics_slice == "fee2"
                ) {
                  var index_uuid = index;
                  that.setData({
                    characteristicsId: characteristics[index_uuid].uuid, //确定的写入UUID
                  });
                }
              }
            }
          } // console.log('使能characteristicsId', that.data.notycharacteristicsId);

          // console.log('写入characteristicsId', that.data.characteristicsId);

          that.notycharacteristicsIdFun(); //使能事件
        },
      });
    },

    /* 使能函数 */
    notycharacteristicsIdFun: function () {
      var that = this;
      var recv_value_ascii = "";
      var string_value = "";
      var recve_value = "";
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
            var turn_back = "";
            var turn_back_hex = "";
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

            if (turn_back_hex == "5504830100d2") {
              uni.hideLoading();
              uni.showToast({
                title: "投币成功",
              });
            } // console.log('最终转回来的值', turn_back);

            var recv_number_1 = that.recv_number + turn_back.length;
            var recv_number = Math.round(recv_number_1);
            that.setData({
              recv_number: recv_number,
              recv_value: that.recv_value + turn_back,
            });
          });
        },
        fail: function (res) {
          // console.log('使能失败', res);
        },
      });
    },

    Sendincoins: function () {
      var that = this;
      console.log("---发送money" + that.money_value);
      uni.openBluetoothAdapter({
        success: function (res) {
          var send1 = "aa";
          var send2 = "83";
          var send3 = "04";
          var send4 = "01";
          var send5 = "0" + that.port;
          var send6 = that.money_value + "" || "02";
          var valSize = send6.length;

          if (valSize < 2 && valSize > 0) {
            send6 = "0" + send6;
          }

          var send7 = send2 ^ send3 ^ send4 ^ send5 ^ send6; // console.log("拼凑值===" + send1 + '' + send2 + '' + send3 + '' + send4 + '' + send5 + '' + send6 + '' + send7)
          // var value_initial = 'aa830401010186';

          var value_initial =
            send1 +
            "" +
            send2 +
            "" +
            send3 +
            "" +
            send4 +
            "" +
            send5 +
            "" +
            send6 +
            "" +
            send7;
          /* 判断字节是否超过20字节 */

          if (value_initial.length > 20) {
            //当字节超过20的时候，采用分段发送
            if (that.send_string == true) {
              //选择16进制发送时
              var value_initial_exceed = value_initial; //将输入框的值取过来，方便循环

              var value_initial_average = Math.ceil(
                value_initial_exceed.length / 20
              ); //将value_initial_exceed的长度除以20，余数再向上取一，确定循环几次
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
                send_number: send_number,
              });
            } else {
              //选择Ascii码发送

              /* 当选择以Ascii字符发送的时候 */
              var value_split = value_initial.split(""); //将字符一个一个分开
              // console.log('value_split', value_split);

              for (var i = 0; i < value_split.length; i++) {
                value_ascii =
                  value_ascii + value_split[i].charCodeAt().toString(16); //转为Ascii字符后连接起
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
                send_number: send_number,
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
              send_number: send_number,
            });
          }
        },
        fail: function (res) {
          uni.showModal({
            content: "请开启手机蓝牙后再试",
            success: function () {
              uni.switchTab({
                url: "../device/device",
                success: function () {
                  // console.log("success");
                },
                fail: function (res) {
                  // console.log("fail" + res);
                },
              });
            },
          });
        },
      });
    },

    write: function (str) {
      var that = this;
      var value = str; // console.log('value', value);

      var valSize = value.length;

      if (valSize < 2 && valSize > 0) {
        value = "0" + value;
      }

      console.log("---" + value);
      /* 将数值转为ArrayBuffer类型数据 */

      var typedArray = new Uint8Array(
        (value + "\r\n").match(/[\da-f]{2}/gi).map(function (h) {
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
          console.log("数据发送成功", res);
          return true;
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
              return true;
            },
            fail: function (res) {
              console.log("第2次调用失败", res);
              /* 调用失败时，再次调用 */

              uni.writeBLECharacteristicValue({
                deviceId: that.deviceId,
                serviceId: that.serviceId,
                characteristicId: that.characteristicsId,
                value: buffer,
                success: function (res) {
                  return true; // console.log('第3次数据发送成功', res);
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
                  return false;
                  uni.showModal({
                    title: "提示",
                    content: "设备不在线或距离较远",
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        uni.switchTab({
                          url: "../device/device",
                        });
                      }
                    },
                  }); // console.log('第3次调用失败', res);
                },
              });
            },
          });
        },
      });
    },

    Payincoins: function () {
      var that = this;
      that.setData({
        disabled: true,
      });
      uni.connectSocket({
        url: "wss://app.tengfuchong.com/websocket",
        success: function (res) {
          console.log("socket连接打开===" + JSON.stringify(res));
        },
      });
      uni.onSocketMessage(function (res) {
        var status = res.data;

        if (status == 1) {
          that.senddata();
          uni.closeSocket();
        }
      });
      uni.openBluetoothAdapter({
        success: function (res) {
          var openid = that.openid;
          console.log(openid);
          uni.request({
            url: "https://app.tengfuchong.com/testpay/pay",
            data: {
              openId: openid,
              tempid: that.tempid,
              code: that.deviceName,
              port: that.port,
            },
            header: {
              "content-type": "application/x-www-form-urlencoded", // 默认值
            },
            method: "POST",
            success: function (res) {
              that.doWxPay(res.data);
            },
            fail: function (err) {
              uni.showToast({
                icon: "none",
                title: "服务器异常，清稍候再试",
              });
            },
          });
        },
        fail: function () {
          uni.showModal({
            content: "请开启手机蓝牙后再试",
            success: function () {
              uni.switchTab({
                url: "../device/device",
                success: function () {},
                fail: function (res) {},
              });
            },
          });
        },
      });
    },

    doWxPay(param) {
      var that = this; //小程序发起微信支付

      uni.requestPayment({
        timeStamp: param.timeStamp,
        //记住，这边的timeStamp一定要是字符串类型的，不然会报错
        nonceStr: param.nonceStr,
        package: param.packagess,
        signType: "MD5",
        paySign: param.paySign,
        success: function (event) {
          // success
          uni.showToast({
            title: "支付成功",
            icon: "success",
            duration: 2000,
            success: function () {
              uni.showToast({
                title: "支付成功",
                success: function (res) {
                  uni.closeBLEConnection({
                    deviceId: that.deviceId,
                    success: function (res) {
                      uni.switchTab({
                        url: "../device/device",
                      });
                    },
                  });
                },
              });
            },
          });
        },
        fail: function (res) {
          uni.closeSocket();
          uni.showToast({
            title: "支付取消",
          });
          that.setData({
            disabled: false,
          });
        },
        complete: function () {},
      });
    },

    checkBluetoothIfOpen: function () {
      uni.openBluetoothAdapter({
        success: function (res) {},
        fail: function (res) {
          uni.showModal({
            content: "请开启手机蓝牙后再试",
          });
          uni.navigateTo({
            url: "../device/device",
          });
        },
      });
    },

    senddata() {
      var that = this;
      var send1 = "aa";
      var send2 = "83";
      var send3 = "04";
      var send4 = "01";
      var send5 = "0" + that.port;
      var send6 = that.money_value + "" || "02";
      var valSize = send6.length;

      if (valSize < 2 && valSize > 0) {
        send6 = "0" + send6;
      }

      var send7 = send2 ^ send3 ^ send4 ^ send5 ^ send6;
      var value_initial =
        send1 +
        "" +
        send2 +
        "" +
        send3 +
        "" +
        send4 +
        "" +
        send5 +
        "" +
        send6 +
        "" +
        send7;
      /* 判断字节是否超过20字节 */

      if (value_initial.length > 20) {
        //当字节超过20的时候，采用分段发送
        if (that.send_string == true) {
          //选择16进制发送时
          var value_initial_exceed = value_initial; //将输入框的值取过来，方便循环

          var value_initial_average = Math.ceil(
            value_initial_exceed.length / 20
          ); //将value_initial_exceed的长度除以20，余数再向上取一，确定循环几次
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
            send_number: send_number,
          });
        } else {
          //选择Ascii码发送

          /* 当选择以Ascii字符发送的时候 */
          var value_split = value_initial.split(""); //将字符一个一个分开
          // console.log('value_split', value_split);

          for (var i = 0; i < value_split.length; i++) {
            value_ascii =
              value_ascii + value_split[i].charCodeAt().toString(16); //转为Ascii字符后连接起
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
            send_number: send_number,
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
          send_number: send_number,
        });
      }
    },

    buf2hex: function (buffer) {
      // buffer is an ArrayBuffer
      return Array.prototype.map
        .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
    },

    base64_encode: function (str) {
      var c1;
      var c2;
      var c3;
      // 编码，配合encodeURIComponent使用
      var base64EncodeChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var i = 0;
      var len = str.length;
      var strin = "";
      while (i < len) {
        c1 = str.charCodeAt(i++) & 255;

        if (i == len) {
          strin += base64EncodeChars.charAt(c1 >> 2);
          strin += base64EncodeChars.charAt((c1 & 3) << 4);
          strin += "==";
          break;
        }

        c2 = str.charCodeAt(i++);

        if (i == len) {
          strin += base64EncodeChars.charAt(c1 >> 2);
          strin += base64EncodeChars.charAt(
            ((c1 & 3) << 4) | ((c2 & 240) >> 4)
          );
          strin += base64EncodeChars.charAt((c2 & 15) << 2);
          strin += "=";
          break;
        }

        c3 = str.charCodeAt(i++);
        strin += base64EncodeChars.charAt(c1 >> 2);
        strin += base64EncodeChars.charAt(((c1 & 3) << 4) | ((c2 & 240) >> 4));
        strin += base64EncodeChars.charAt(((c2 & 15) << 2) | ((c3 & 192) >> 6));
        strin += base64EncodeChars.charAt(c3 & 63);
      }

      return strin;
    },

    callPhone: function () {
      var that = this;
      console.log(that.phonenum);
      uni.makePhoneCall({
        phoneNumber: that.phonenum,
        success: function (res_makephone) {
          console.log("呼叫电话返回：", res_makephone);
        },
      });
    },

    Backhome: function () {
      var that = this;
      uni.closeBLEConnection({
        deviceId: that.deviceId,
        success: function (res) {
          uni.switchTab({
            url: "../device/device",
          });
        },
      });
    },

    inadver: function () {
      uni.navigateTo({
        url: "../ad/ad",
      });
    },
  },
};
</script>
<style>
.container {
  padding: 0 20rpx;
  font-size: 12px;
}
.addincoins {
  margin-top: 5px;
  width: 100%;
  background-color: #44b549;
  color: white;
}
.addincoins .ad navigator image {
  width: 100%;
  height: 300rpx;
}
.connect_device_name {
  font-size: 14px;
  margin: 15rpx 0;
}
.choosemoney .title {
  font-size: 14px;
  margin: 30rpx 0 10rpx;
}
.choosemoney .btn {
  border: 1px solid #ccc !important;
  height: 80rpx;
  border-radius: 12rpx;
  text-align: center;
  line-height: 70rpx;
  border-bottom: none !important;
  font-size: 12px;
  box-sizing: border-box;
}

.choosemoney .tr:last-child .btn {
  border-bottom: 1px solid #ccc !important;
  margin-bottom: 25rpx;
}

.addincoins,
.payincoins {
  background-color: #1aad19;
  border-radius: 6rpx;
  height: 75rpx;
  line-height: 75rpx;
  margin-bottom: 40rpx;
  font-size: 12px;
  color: #fff;
}
.addincoins[disabled],
.payincoins[disabled] {
  background-color: #ccc !important;
}

.payincoins {
  margin-top: 5px;
  width: 100%;
  background-color: #1aad19;
  color: white;
}
.money {
  width: 100%;
}
.goIndex {
  margin-bottom: 50rpx;
}
#connect_phone {
  font-size: 13px;
}
#connect_phone text {
  color: #3b7fb9;
}
.choosemoney {
  width: 100%;
  white-space: normal;
  overflow: hidden;
}
.btn {
  border: 1px solid #ccc !important;
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #ccc;
  border-radius: 15rpx;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.active {
  border: 1rpx solid #1aad19;
  background-color: #1aad19;
  color: #ffffff;
}
</style>
