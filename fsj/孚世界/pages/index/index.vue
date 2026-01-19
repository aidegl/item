<template>
	<view class="content">
		<button style="margin:20px 0 20px 0;" @click="toUserInfoPage">个人资料</button>
		<uni-forms-item label="切换登录方式" labelWidth="70">
			<uni-data-checkbox :multiple="false" v-model="loginType" :localdata="loginTypeOption" mode="button"></uni-data-checkbox>
		</uni-forms-item>
		<button @click="toLogin">前往登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loginType: "weixin",
				loginTypeOption: [{
					"value": "weixin",
					"text": "微信"
				}, {
					"value": "univerify",
					"text": "一键登录"
				}, {
					"value": "username",
					"text": "账号密码"
				}, {
					"value": "smsCode",
					"text": "手机验证码"
				}]
			}
		},
		onLoad() {},
		methods: {
			toLogin() {
				if (this.loginType == 'username') {
					uni.navigateTo({
						url: "/uni_modules/uni-id-pages/pages/login/login-withpwd"
					})
				} else {
					uni.navigateTo({
						url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd?type=" + this.loginType,
						animationType:"none",
						animationDuration:0
					})
				}
			},
			toUserInfoPage() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true"
				})
			}
		}
	}
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 6rpx;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 18px;
		color: #8f8f94;
	}
</style>
