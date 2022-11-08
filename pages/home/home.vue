<template>
    <!-- home.wxml -->
    <view class="container">
        <view class="userinfo">
            <button v-if="!hasUserInfo && canIUse" open-type="getUserInfo" @getuserinfo="getUserInfo">获取头像昵称</button>
            <block v-else>
                <image @tap="bindViewTap" class="userinfo-avatar" :src="userInfo.avatarUrl" mode="cover"></image>
                <text class="userinfo-nickname">{{ userInfo.nickName }}</text>
            </block>
        </view>
        <view class="usermotto">
            <text class="user-motto">{{ motto }}</text>
        </view>
    </view>
</template>

<script>
//index.js
//获取应用实例
const app = getApp();
export default {
    data() {
        return {
            motto: '欢迎进入自助充电平台小程序',
            userInfo: {
                avatarUrl: '',
                nickName: ''
            },
            hasUserInfo: false,
            canIUse: uni.canIUse('button.open-type.getUserInfo')
        };
    },
    onLoad: function () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
            console.log('---' + JSON.stringify(this.userInfo));
        } else if (this.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.globalData.userInfoReadyCallback = (res) => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                });
                console.log('---' + res.userInfo);
            };
        } else {
            uni.login({
                success: function (res) {
                    if (res.code) {
                        console.log('code' + res.code); //在没有 open-type=getUserInfo 版本的兼容处理

                        uni.getUserInfo({
                            success: (res) => {
                                app.globalData.userInfo = res.userInfo;
                                this.setData({
                                    userInfo: res.userInfo,
                                    hasUserInfo: true
                                });
                                console.log(res.userInfo);
                            }
                        });
                    }
                }
            });
        }
    },
    methods: {
        getUserInfo: function (e) {
            console.log('---' + e);
            app.globalData.userInfo = e.detail.userInfo;
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            });
        },

        bindViewTap() {
            console.log('占位：函数 bindViewTap 未声明');
        }
    }
};
</script>
<style>
/**home.wxss**/
.userinfo {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.userinfo-avatar {
    width: 128rpx;
    height: 128rpx;
    margin: 20rpx;
    border-radius: 50%;
}

.userinfo-nickname {
    color: #aaa;
}

.usermotto {
    margin-top: 30%;
}
</style>
