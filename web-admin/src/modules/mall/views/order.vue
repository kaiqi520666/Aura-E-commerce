<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />

			<cl-flex1 />
			<!-- 条件搜索 -->
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<!-- 分页控件 -->
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: "mall-order",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import UserSelect from "/$/user/components/user-select.vue";
import { reactive } from "vue";

const { service } = useCool();
const { t } = useI18n();
const options = reactive({
	status: [
		{
			label: t("待支付"),
			value: 'PENDING_PAYMENT',
			type: "info",
		},
		{
			label: t("已支付"),
			value: 'PAID',
			type: "success",
		},
		{
			label: t("已完成"),
			value: 'COMPLETED',
			type: "success",
		},
	],
});
// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: t("订单号"),
			prop: "orderNo",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("选择用户"),
			prop: "userId",
			component: { vm: UserSelect },
			required: true,
		},
		{
			label: t("订单状态"),
			prop: "status",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("商品总额"),
			prop: "subtotalAmount",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("订单总额"),
			prop: "totalAmount",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("商品件数"),
			prop: "itemCount",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("地址快照"),
			prop: "addressSnapshot",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("支付方式"),
			prop: "paymentMethod",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("代付Token"),
			prop: "proxyToken",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("支付时间"),
			prop: "paidTime",
			component: {
				name: "el-date-picker",
				props: { type: "datetime", valueFormat: "YYYY-MM-DD HH:mm:ss" },
			},
			span: 12,
		},
	],
});

// cl-table
const Table = useTable({
	columns: [
		{ label: t("#"), type: "index" },
		{ label: t("订单号"), prop: "orderNo", minWidth: 120 },
		{ label: t("订单状态"), prop: "status", minWidth: 120, dict: options.status },
		{ label: t("商品总额"), prop: "subtotalAmount", minWidth: 120 },
		{ label: t("订单总额"), prop: "totalAmount", minWidth: 120 },
		{ label: t("商品件数"), prop: "itemCount", minWidth: 120 },

		{ label: t("支付方式"), prop: "paymentMethod", minWidth: 120 },
		{ label: t("代付Token"), prop: "proxyToken", minWidth: 120 },
		{
			label: t("支付时间"),
			prop: "paidTime",
			minWidth: 170,
			sortable: "custom",
			component: { name: "cl-date-text" },
		},
		{
			label: t("创建时间"),
			prop: "createTime",
			minWidth: 170,
			sortable: "desc",
			component: { name: "cl-date-text" },
		},
		{ type: "op", buttons: ["edit"] },
	],
});

// cl-search
const Search = useSearch();

// cl-crud
const Crud = useCrud(
	{
		service: service.mall.order,
	},
	(app) => {
		app.refresh();
	},
);

// 刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}
</script>
