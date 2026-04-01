<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 新增按钮 -->
			<cl-add-btn />
			<!-- 删除按钮 -->
			<cl-multi-delete-btn />
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
	name: 'mall-product'
});

import { useCrud, useTable, useUpsert, useSearch } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';
import { reactive } from 'vue';

const { service } = useCool();
const { t } = useI18n();

const options = reactive({
	status: [
		{
			label: t('启用'),
			value: 1,
			type: 'success'
		},
		{
			label: t('禁用'),
			value: 0,
			type: 'danger'
		}
	],
	featured: [
		{
			label: t('是'),
			value: 1,
			type: 'success'
		},
		{
			label: t('否'),
			value: 0,
			type: 'danger'
		}
	],
	bestSeller: [
		{
			label: t('是'),
			value: 1,
			type: 'success'
		},
		{
			label: t('否'),
			value: 0,
			type: 'danger'
		}
	]
});
// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: t('选择分类'),
			prop: 'categoryId',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('商品标识'),
			prop: 'slug',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('商品名称'),
			prop: 'name',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('简短描述'),
			prop: 'subtitle',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12
		},
		{
			label: t('商品描述'),
			prop: 'description',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12
		},
		{
			label: t('主图'),
			prop: 'mainImage',
			component: { name: 'cl-upload' },
			span: 12
		},
		{
			label: t('商品图集'),
			prop: 'gallery',
			component: { name: 'cl-upload', props: { multiple: true } },
			span: 12
		},
		{
			label: t('价格'),
			prop: 'price',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('划线价'),
			prop: 'comparePrice',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12
		},
		{
			label: t('库存'),
			prop: 'stock',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('状态'),
			prop: 'status',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('是否精选'),
			prop: 'featured',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('是否热卖'),
			prop: 'bestSeller',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('评分'),
			prop: 'rating',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		},
		{
			label: t('评论数'),
			prop: 'reviewCount',
			component: { name: 'el-input', props: { clearable: true } },
			span: 12,
			required: true
		}
	]
});

// cl-table
const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: t('分类ID'), prop: 'categoryId', minWidth: 120 },
		{ label: t('商品标识'), prop: 'slug', minWidth: 120 },
		{ label: t('商品名称'), prop: 'name', minWidth: 120 },

		{ label: t('主图'), prop: 'mainImage', minWidth: 120, component: { name: 'cl-image' } },
		{ label: t('商品图集'), prop: 'gallery', minWidth: 120, component: { name: 'cl-image' } },
		{ label: t('价格'), prop: 'price', minWidth: 120 },
		{ label: t('划线价'), prop: 'comparePrice', minWidth: 120 },
		{ label: t('库存'), prop: 'stock', minWidth: 120 },
		{ label: t('状态'), prop: 'status', minWidth: 120, dict: options.status },
		{ label: t('是否精选'), prop: 'featured', minWidth: 120, dict: options.featured },
		{ label: t('是否热卖'), prop: 'bestSeller', minWidth: 120, dict: options.bestSeller },
		{ label: t('评分'), prop: 'rating', minWidth: 120 },
		{ label: t('评论数'), prop: 'reviewCount', minWidth: 120 },
		{
			label: t('创建时间'),
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc',
			component: { name: 'cl-date-text' }
		},

		{ type: 'op', buttons: ['edit', 'delete'] }
	]
});

// cl-search
const Search = useSearch();

// cl-crud
const Crud = useCrud(
	{
		service: service.mall.product
	},
	app => {
		app.refresh();
	}
);

// 刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}
</script>
