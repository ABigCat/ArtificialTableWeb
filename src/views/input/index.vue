<template>
  <div>
    <el-steps :active="activeStep" class="steps" finish-status="success">
      <el-step v-for='eachStep in steps' :key='eachStep.title' :title='eachStep.title' :description='eachStep.description'></el-step>
    </el-steps>

    <el-tabs v-model="getActiveStep" tab-position="hidden">
      <!-- contains 3 steps -->

      <!-- STEP - 1 -->
      <el-tab-pane name="0">
        <span slot="label" style="display:none"></span>
        <div id="step-import"
          class="content-wrapper flex-parent">
          <!-- STEP - 1 - 左边的导入表格 -->
          <section class="table-wrapper flex-left flex-half">
            <hot-table :settings="hotSettings" ref="hotTable" class="table"></hot-table>
          </section>
          <!-- STEP - 1 -  右边的统计和控制项 -->
          <section class="menu-wrapper flex-right flex-half">
            <!-- STEP - 1 - 导入工具 -->
            <div id="menu-input-helper">
              <import-excel-component @on-selected-file='onSelectedLocalExcel'></import-excel-component>
            </div>
            <!-- STEP - 1 - 警示公告板 -->
            <div id="import-menu-table-board">
              <el-alert v-for="alert of importAlertList" :key="alert.title" :title="alert.title" :description="alert.description" :type="alert.type" show-icon class="alert"></el-alert>
            </div>
            <!-- STEP - 1 - 按钮组 -->
            <div id="menu-continue" class="menu-continue">
              <el-switch
                style="display: block"
                id="menu-continue-switch-btn"
                v-model="importDataHasHead"
                active-color="#4caf50"
                inactive-color="#ff4949"
                inactive-text="数据包含列名"
                >
              </el-switch>
              <el-select v-model="remoteLesson" placeholder="请选择要导入到的课程" @change="onSelectedLesson">
                <el-option
                  v-for="item in remoteLessonList"
                  :value="item.id"
                  :label="item.name"
                  :key="item.id"
                  >
                </el-option>
              </el-select>
              <el-button class="button" type="success" @click="toStep(1, 2)" size="mini">下一步<i class="el-icon-arrow-right el-icon--right"></i></el-button>
            </div>
            <!-- STEP - 1 - 统计信息 -->
            <div id="menu-data-previewer">
              <p v-for="stats of importTableAnalysis" :key="stats.id">
                <span>{{stats.title}}<template v-if="stats.meaning">({{stats.meaning}})</template></span>
                <span>{{stats.content}}</span>
              </p>
            </div>
          </section>
        </div>
      </el-tab-pane><!-- step 1 end, and step 2 start -->
       <!-- STEP - 2 -->
      <el-tab-pane name="1">
        <span slot="label" style="display:none"></span>
        <div id="step-settings" slot-scope="pane"
          class="content-wrapper flex-parent">
          <!-- STEP - 2 - 左边的导入表格 -->
          <section class="flex-left flex-70">
          <!-- STEP - 2 -->
          <!-- 使用 v-if 重新渲染表格，消耗一定的性能，使得表格强制刷新 -->
          <el-table v-if="activeStep === 1" id='settings-table' ref='settingsTable' :data="settingsPageData.dataset" height="calc(100vh - 200px)" border
            >
            <el-table-column
                v-for="title in settingsPageData.titles" :prop="String(title.idx)" :key="title.idx"
                min-width="150px" width="200px">
                <!-- 自定义表头，用于选择列的属性 -->
                <template slot="header" slot-scope="scope" >
                <!-- <template slot="header"> -->
                  <div class="settings-table-header">
                    <label :for='"el-selector-for-type-col-" + title.idx'
                        class="selector-for-hidden-selector" :style='"background:" + getSelectorColorByType(title)+";"'>
                    </label>
                    <el-select v-model="title.type" placeholder="请选择"
                      :id='"el-selector-for-type-col-" + title.idx'
                      class="hidden-selector" size="mini">
                      <el-option
                        v-for="item in headTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                    <!-- 如果 type === title，渲染选择框 -->
                    <template v-if="title.type === 'title'">
                      <el-input type="text" v-model="title.name"
                        placeholder="列名" size="mini" class="title-name"/>
                      <el-select v-model="title.titleGroup" placeholder="类别"
                      size="mini" class="title-name">
                        <el-option v-for='titleGroup in remoteTitleGroupList' :key='titleGroup.id'
                          :label='titleGroup.name' :value='titleGroup.id'>
                        </el-option>
                      </el-select>
                    </template>
                    <!-- 如果 type === sid，渲染学号框 -->
                    <template v-else-if="title.type === 'sid'">
                      学号
                    </template>
                    <!-- 如果 type === default，渲染默认框 -->
                    <template v-else-if="title.type === 'default'">
                      <el-button @click="onTitleTypeClick(title, 'sid')"
                      size='mini' type='primary'>学号</el-button>
                      <el-button @click="onTitleTypeClick(title, 'title')"
                      size='mini' type='success' >成绩</el-button>
                      <el-button @click="onTitleTypeClick(title, 'useless')"
                      size='mini' type='danger'>其它</el-button>
                    </template>
                    <!-- 如果 type !== sid || title || default，则渲染"无用项"框 -->
                    <template v-else-if="title.type === 'useless'">
                      不录入
                    </template>
                  </div>
                </template>
                <template slot-scope="scope">
                  <div class="setting-table-cell" :style='"background:"+getCellColorByType(title.type)+";"'>
                    <el-input v-model="scope.row[title.idx]">
                    </el-input>
                  </div>
                </template>
            </el-table-column>
          </el-table>
          </section>
          <!-- STEP - 2 -  右边的补充项 -->
          <section class="menu-wrapper flex-right flex-30">
            <div id="menu-data-previewer">
              <p v-for="stats of settingsTableAnalysis" :key="stats.id">
                <span>{{stats.title}}<template v-if="stats.meaning">({{stats.meaning}})</template></span>
                <span>{{stats.content}}</span>
              </p>
              <!-- STEP - 2 - 警示公告板 -->
              <div id="settings-menu-table-board">
                <el-alert v-for="alert of settingsAlertList" :key="alert.title" :title="alert.title" :description="alert.description" :type="alert.type" show-icon class="alert"></el-alert>
              </div>
            </div>
            <el-button class="button" type="success" @click="toStep(2, 1)" size="mini"><i class="el-icon-arrow-left el-icon--left"></i>上一步</el-button>
            <el-button class="button" type="success" @click="toStep(2, 3)" size="mini">下一步<i class="el-icon-arrow-right el-icon--right"></i></el-button>
          </section>
        </div>
      </el-tab-pane><!-- step 2 end, and step 3 start -->
      <el-tab-pane name="2">
        <span slot="label" style="display:none"></span>
        <div id="step-preview"
        >
          <!-- STEP - 3 - 步骤操作菜单 -->
          <el-button class="button" type="success" @click="toStep(3, 2)" size="mini"><i class="el-icon-arrow-left el-icon--left"></i>上一步</el-button>
          <el-button class="button" type="success" @click="submit()" size="mini">提交<i class="el-icon-arrow-right el-icon--right"></i></el-button>

          <!-- CONTAINER 容纳错误信息 -->
          <el-card v-if="submitErrorMessage.existTitleNameList.length > 0">
            <el-alert v-for="name in submitErrorMessage.existTitleNameList" :key="name" type="warning"
              :title="'当前列名 [' + name + '] 已被教师使用, 分数的插入操作将会覆盖之前存在的分数'">
            </el-alert>
          </el-card>

          <el-card v-if="submitErrorMessage.errorTitleNameList.length > 0">
            <el-alert v-for="name in submitErrorMessage.errorTitleNameList" :key="name" type="error"
              :title="'[' + name + '] 插入失败'">
            </el-alert>
          </el-card>
          
          <el-card v-if="submitErrorMessage.existPointList.length > 0">
            <el-alert type="warning"
              title="下列分数覆盖了原来的值">
            </el-alert>
            <el-table :data="submitErrorMessage.existPointList" style="width: 100%">
              <el-table-column prop="sid" label="学号"></el-table-column>
              <el-table-column prop="pointNumber" label="分数"></el-table-column>
              <el-table-column prop="title_name" label="列名"></el-table-column>
              <el-table-column label="大项">
                <template slot-scope="scope">
                  <span>{{ getTitleGroup(scope.row.titleGroup_id) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          
          <el-card v-if="submitErrorMessage.errorPointList.length > 0">
            <el-alert type="error"
              title="下列分数插入失败">
            </el-alert>
            <el-table :data="submitErrorMessage.errorPointList" style="width: 100%">
              <el-table-column prop="sid" label="学号"></el-table-column>
              <el-table-column prop="pointNumber" label="分数"></el-table-column>
              <el-table-column prop="title_name" label="列名"></el-table-column>
              <el-table-column label="大项">
                <template slot-scope="scope">
                  <span>{{ getTitleGroup(scope.row.titleGroup_id).name }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          
 
          <!-- STEP - 3 - 预览表格 -->
          <!-- 使用 v-if 重新渲染表格，消耗一定的性能，使得表格强制刷新 -->
          <el-table v-if="activeStep === 2" :key="activeStep" id='preview-table' ref='previewTable'
            :data="previewPageData.dataset"
            class="preivew-table"
            border stripe size="mini"
          >
            <el-table-column label="学号" width="150px">
              <template slot-scope="scope">
                {{ getStudentNumber(scope) }}
              </template>
            </el-table-column>

            <el-table-column
                v-for="title in previewPageData.titles" :key="title.idx"
                :prop="String(title.idx)" :label="title.name"
                min-width="80px" width="120px">
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { HotTable } from '@handsontable/vue'
import Handsontable from 'handsontable'
import ImportExcelComponent from '@/components/ImportExcel.vue'

// 引入 viewmodel
import titleGroupViewModel from '@/viewmodel/titlegroups'
import lessonViewModel from '@/viewmodel/lesson'
import pointViewModel from '@/viewmodel/point'

import PointMock from '@/mock/point'
import TitleMock from '@/mock/title'

// 引入常量，全是提示信息字符串
import { REQUIRED_TITLEGROUP, REQUIRED_TITLE, CLIP_BOARD_ALERT, REQUIRE_STUDENT_COLUMN, REQUIRE_STUDENT_COLUMN_LEFT, DUPLICATE_SID, REQUIRED_SID, REQUIRED_AT_LEAST_A_TITLE } from '@/utils/alerts'

const COLOR_SID = '#1976D2'
const COLOR_UNFINISHED = '#FFCC33'
const COLOR_TITLE = '#4caf50'
const CELL_COLOR_SID = 'linear-gradient(135deg, ' + COLOR_SID + ', ' + COLOR_SID + ' 6px , #FFF 10px, #FFF 100%)'
const CELL_COLOR_TITLE = '#FFF'
const CELL_COLOR_USELESS = '#DDD'
const COLOR_LEFT_HALF_TITLE = 'linear-gradient(90deg, ' + COLOR_TITLE + ', ' + COLOR_TITLE + ' 50% ,' + COLOR_UNFINISHED + ' 50%, ' + COLOR_UNFINISHED + ' 100%)'
const COLOR_RIGHT_HALF_TITLE = 'linear-gradient(90deg, ' + COLOR_UNFINISHED + ', ' + COLOR_UNFINISHED + ' 50% ,' + COLOR_TITLE + ' 50%, ' + COLOR_TITLE + ' 100%)'

const calHeight = () => {
  return window.innerHeight - 200
}

/** xlsx 的输出模式被制定为 header:1, 与 handsontable 兼容， 不需要转换
 */
const xlsxToHotAdapter = (xlsxData) => {
  return xlsxData
}

/**
 * 将 importPage 中的 Handontable 数据转化为 settingsPage 中的 Element 需要的数据格式
 * 主要目的是生成和保存列名
 * @return Object
 *           |- titles  // made by hotData idx
 *           |    |- idx: column index
 *           |    |- type: default set to 'title'
 *           |    |- name: set column name
 *           |    |- titlegroup
 *           |
 *           |- dataset // hotData
 */
const hotToElementAdapter = (hotData, withHeader) => {
  const titleMap = new Map()
  const resDataSet = []
  const colNameList = []
  for (let colIdx = 0; colIdx < hotData[0].length; colIdx++) {
    if (withHeader) {
      colNameList[colIdx] = hotData[0][colIdx]
    }
    hotData.forEach(rowArray => {
      // 仅保留有数据的列
      if (rowArray[colIdx] !== null && rowArray[colIdx] !== '' && rowArray[colIdx] !== undefined) {
        // 初始化 title 项
        if (!titleMap.get(colIdx)) {
          const newTitle = { idx: colIdx, type: 'default', name: colNameList[colIdx], titleGroup: undefined }
          // 如果包含项名，则自动设置 title.type
          if (withHeader && !(hotData[0][colIdx] === undefined || hotData[0][colIdx] === null || hotData[0][colIdx] === '')) {
            // console.log(hotData[0][colIdx])
            if (RegExp('学号').test(hotData[0][colIdx])) newTitle.type = 'sid'
            else newTitle.type = 'title'
          }
          titleMap.set(colIdx, newTitle)
        }
      }
    })
  }
  // 输出数据集结果
  hotData.forEach((rowArray, rowIdx) => {
    resDataSet[rowIdx] = [];
    [...titleMap.keys()].forEach(colIdx => (resDataSet[rowIdx][colIdx] = rowArray[colIdx]))
  })

  // 如果是包含项名的输入，则将第一列删除
  if (withHeader) resDataSet.shift()

  return {
    titles: [...titleMap.values()],
    dataset: resDataSet
  }
}

/**
 * 将 settingsPage 中的 Element 数据过滤，只剩下需要的字段。
 * @return output: Object
 *           |- sid
 *           |- titles  // made by hotData idx
 *           |    |- idx: column index
 *           |    |- name: set column name
 *           |
 *           |- dataset // hotData
 */
const previewFilter = (settingsData) => {
  const dataset = JSON.parse(JSON.stringify(settingsData.dataset))
  const titles = JSON.parse(JSON.stringify(settingsData.titles))

  let sidColIdx
  const deprecatedColIdx = []

  const sid = []
  const previewDataset = []
  const previewTitles = []

  titles.forEach((title, idx) => {
    if (title.type === 'sid') {
      sidColIdx = String(idx)
      return
    }
    if (title.type === 'useless' || title.type === 'default') {
      deprecatedColIdx.push(String(idx))
      return
    }
    title.type = 'title'
    previewTitles.push(title)
  })

  dataset.forEach((row, rowIdx) => {
    const sidItem = row[sidColIdx]
    sid.push(sidItem)
    const previewRow = []
    row.forEach((cell, colIdx) => {
      // 被标记的错误: in 取的是 key, 哪怕目标是数组取的也TM是下标
      // if (String(colIdx) in deprecatedColIdx === false && String(colIdx) !== sidColIdx) {
      if (String(colIdx) !== sidColIdx && !deprecatedColIdx.includes(String(colIdx))) {
        // console.log('\t\tadd ' + cell + '\t' + String(colIdx))
        previewRow.push(cell)
      }
    })
    previewDataset.push(previewRow)
  })

  previewTitles.forEach((title, idx) => (title.idx = String(idx)))

  return {
    titles: previewTitles,
    dataset: previewDataset,
    sid
  }
}

/**
 * @return submitWrapper contains:
 *         |- titles
 *         |- point
 * @description split into 3 steps
 * 1. get student by sid
 * 2. make title array
 * 3. make point array
 */
const submitConverter = (previewPageData, lessonId) => {
  console.log(previewPageData)
  const newTitleItemArrayArray = []
  previewPageData.titles.forEach(title => {
    const item = TitleMock.getTitlePrototype()
    item.name = title.name
    item.titleGroup_id = title.titleGroup
    newTitleItemArrayArray.push(item)
  })
  const newPointItemArray = []
  // 第一层循环的 row 表示第 i 行, sIdx 表示当前录到第 i 个学生的成绩
  previewPageData.dataset.forEach((row, sIdx) => {
    // console.log(row)
    row.forEach((point, idx) => {
      const item = PointMock.getPointPrototype()
      // console.log(item)
      item.pointNumber = point
      item.date = Date.parse(new Date())
      item['sid'] = previewPageData.sid[sIdx]
      item['title_name'] = previewPageData.titles[idx]['name']
      item['titleGroup_id'] = previewPageData.titles[idx]['titleGroup']
      // item['_titleIdx'] = idx
      newPointItemArray.push(item)
    })
  })
  console.log(newPointItemArray)
  console.log(newTitleItemArrayArray)
  const sid_list = previewPageData.sid
  const description = '分为四个部分, title 列表和 point 列表, <br/>' +
    '其中 title 列表需要补充 classInfo_id 字段, 最后创建后创建 id 字段.<br/>' +
    '其中 point 列表需要补充 classInfo_id, student_id, title_id 字段, 最后从创建生成 id 字段.<br/>' +
    '其中 lesson_id 字段包含所在课程 <br/> ' +
    '其中 sid_list 字段包含学生学号列表 <br/> '
  return {
    title_list: newTitleItemArrayArray,
    point_list: newPointItemArray,
    lesson_id: lessonId,
    sid_list,
    description
  }
}

/**
 * export VUE COMPONENT start here
 */
export default {
  components: {
    HotTable, ImportExcelComponent
  },
  data() {
    return {
      activeStep: 0,
      steps: [
        { title: '引入数据', description: '将您的数据直接粘贴到面板，或导入一个 Excel 文件' },
        { title: '选择要导入系统的数据', description: '选择要导入的列项和学生信息，并且补充一些必要的信息' },
        { title: '校验导入结果', description: '确认您的导入结果' }
      ],
      headTypeList: [
        { value: 'default', label: '默认(丢弃)', color: 'repeating-linear-gradient(45deg ,#FFCC33 0, #FFCC33 4px, #665 4px, #665 8px)' },
        { value: 'sid', label: '学号列', color: COLOR_SID },
        { value: 'title', label: '列项名', color: COLOR_UNFINISHED },
        { value: 'useless',
          label: '无用项',
          color: 'linear-gradient(45deg, transparent 0,transparent 45%, #FFCC33 45%, #FFCC33 55%, transparent 55%, transparent 100%),linear-gradient(135deg, #665 0,#665 45%, #FFCC33 45%, #FFCC33 55%, #665 55%, #665 100%)' }
      ],
      hotSettings: {
        startRows: 80,
        startCols: 13,
        minCols: 13,
        minRows: 60,
        height: calHeight(),
        colHeaders: true,
        rowHeaders: true,
        contextMenu: {
          items: {
            'row_above': {
              name: '在当前行的上方插入'
            },
            'row_below': {
              name: '在当前行的下方插入'
            },
            'separator1': Handsontable.plugins.ContextMenu.SEPARATOR,
            'clear_custom': {
              name: '清除所有表格',
              callback: function() {
                this.clear()
              }
            },
            'separator2': Handsontable.plugins.ContextMenu.SEPARATOR,
            'copy': {
              name: '复制'
            },
            'cut': {
              name: '剪切'
            }
          }
        }, // contextMenu-end
        /** 下面都是 hook
         * @see https://handsontable.com/docs/6.2.0/tutorial-introduction.html
         */
        afterChange: function() {
          let importDataset = this.getData()
          // 返回不是全空的行
          importDataset = importDataset.filter((row, rowIndex, arr) => {
            return !row.every(cell => {
              return cell === null || cell === '' || cell === undefined
            })
          })
          const env = this.rootElement.__vue__
          env.$store.dispatch('saveImportTable', { table: importDataset })
        }
      }, // hotSettings-end
      importDataHasHead: false,
      importAlertList: [CLIP_BOARD_ALERT],
      settingsAlertList: [],
      settingsPageData: {},
      previewPageData: {},
      // request from remote
      remoteLesson: '',
      remoteLessonList: [],
      remoteTitleGroupList: [],
      // response after import submit
      submitErrorMessage: {
        existTitleNameList: [],
        errorTitleNameList: [],
        existPointList: [],
        errorPointList: []
      }
    }
  }, // data-end
  computed: {
    importTable: {
      get() {
        return this.$store.state.table.importTable
      }
    },
    getActiveStep: {
      get() {
        return String(this.activeStep)
      },
      set(step) {
        this.activeStep = Number(step)
      }
    },
    importTableAnalysis: {
      get() {
        const importTable = this.$store.state.table.importTable
        let count = 0
        const col_size = importTable[0] && importTable[0].length || 12
        const col_count = Array(col_size).fill(0)
        importTable.forEach(row => {
          row.forEach((cell, idx) => {
            // eslint-disable-next-line
            if (cell === null || cell === '' || cell === undefined) {}// 没有 pass 的第 3024 天, 想它
            else {
              count++
              col_count[idx]++
            }
          })
        })

        const importRows = importTable && importTable.length || 0
        const importCols = col_count.filter(v => v !== 0).length

        const alertsRaiseRules = [
          {
            validator: Math.max(...col_count) < importRows,
            action: () => {
              const description = '您的总行数和最大行数不匹配 (最大的行数为 ' + Math.max(...col_count) + ' 行, 但您共导入了 ' + importRows + ' 行)' + ', 这会导致那些没有学号的分数项在导入时丢失'
              this.addAlert(
                Object.assign(REQUIRE_STUDENT_COLUMN, {
                  type: 'error',
                  description
                }), this.importAlertList)
            },
            close: () => (this.importAlertList = this.closeAlert(this.importAlertList, REQUIRE_STUDENT_COLUMN))
          },
          {
            validator: col_count.find(item => item !== 0) && Math.max(...col_count) !== col_count.find(item => item !== 0),
            action: () => this.addAlert(Object.assign(REQUIRE_STUDENT_COLUMN_LEFT, { type: 'warning' }), this.importAlertList),
            close: () => (this.importAlertList = this.closeAlert(this.importAlertList, REQUIRE_STUDENT_COLUMN_LEFT))
          }
        ]

        alertsRaiseRules.forEach(matchRule => {
          if (matchRule.validator) matchRule.action()
          else matchRule.close()
        })

        return [
          { id: 1, title: '学生数', meaning: '导入的行数', content: importRows },
          { id: 2, title: '类别数', meaning: '导入的列数', content: importCols },
          { id: 3, title: '共计' + count + '条记录' }
        ]
      }
    },
    settingsTableAnalysis: {
      get() {
        if (this.settingsPageData.dataset === undefined) return []

        const settingsTable = this.settingsPageData
        // console.log(settingsTable)
        let titleCount = 0
        let sidCount = 0
        let uselessCount = 0
        let defaultCount = 0
        // let undefinedTitles = []
        // switch rules
        const t_rules = [
          { type: 'sid', action: () => sidCount++ },
          { type: 'title', action: () => titleCount++ },
          { type: 'useless', action: () => uselessCount++ },
          { type: 'default', action: () => defaultCount++ }
        ]
        // executing switch by rule
        settingsTable.titles.forEach(title => {
          t_rules.forEach(rule => {
            if (rule.type === title.type) {
              rule.action()
            }
          })
        })

        /**
         * validator 校验规则, 通过则执行 action(), 否则执行 close()
         */
        const alertsRaiseRules = [
          {
            validator: sidCount > 1,
            action: () => this.addAlert(DUPLICATE_SID, this.settingsAlertList),
            close: () => (this.settingsAlertList = this.closeAlert(this.settingsAlertList, DUPLICATE_SID))
          },
          {
            validator: sidCount < 1,
            action: () => this.addAlert(REQUIRED_SID, this.settingsAlertList),
            close: () => (this.settingsAlertList = this.closeAlert(this.settingsAlertList, REQUIRED_SID))
          },
          {
            validator: titleCount < 1,
            action: () => this.addAlert(REQUIRED_AT_LEAST_A_TITLE, this.settingsAlertList),
            close: () => (this.settingsAlertList = this.closeAlert(this.settingsAlertList, REQUIRED_AT_LEAST_A_TITLE))
          },
          {
            validator: (() => {
              // let rets = false
              for (let index = 0; index < settingsTable.titles.length; index++) {
                const title = settingsTable.titles[index]
                if (title.type === 'title') {
                  if (title.titleGroup === null || title.titleGroup === '' || title.titleGroup === undefined) {
                    return true
                  }
                }
              }
            })(),
            action: () => this.addAlert(REQUIRED_TITLEGROUP, this.settingsAlertList),
            close: () => (this.settingsAlertList = this.closeAlert(this.settingsAlertList, REQUIRED_TITLEGROUP))
          },
          {
            validator: (() => {
              // let rets = false
              for (let index = 0; index < settingsTable.titles.length; index++) {
                const title = settingsTable.titles[index]
                if (title.type === 'title') {
                  if (title.name === null || title.name === '' || title.name === undefined) {
                    return true
                  }
                }
              }
            })(),
            action: () => this.addAlert(REQUIRED_TITLE, this.settingsAlertList),
            close: () => (this.settingsAlertList = this.closeAlert(this.settingsAlertList, REQUIRED_TITLE))
          }
        ]

        alertsRaiseRules.forEach(matchRule => {
          if (matchRule.validator) matchRule.action()
          else matchRule.close()
        })

        return [
          // { id: 1, title: '学生数', content: '24' },
          { id: 2, title: '导入的小项数', content: titleCount },
          // { id: 3, title: '学生数', content: '24' },
          { id: 4, title: '将有' + (uselessCount + defaultCount) + '列被废弃' }
        ]
      }
    }
  },
  methods: {
    addAlert(alert, alertList) {
      // if exist the splice, else execute push statement
      let existAlertIdx
      if ((existAlertIdx = alertList.findIndex(item => item.title === alert.title)) !== -1) {
        alertList.splice(existAlertIdx, 1, alert)
      } else {
        alertList.push(alert)
      }
    },
    closeAlert(list, toClose) {
      if (list.find(item => item.id === toClose.id)) {
        list = list.filter(item => item.id !== toClose.id)
      }
      return list
    },
    getSelectorColorByType(title) {
      const q = this.headTypeList.find(types => {
        return types.value === title.type
      })

      if (title.type === 'title') {
        if (title.name !== '' && title.name !== undefined && title.name !== null && title.titleGroup !== '' && title.titleGroup !== undefined && title.titleGroup !== null) {
          return COLOR_TITLE
        } else if (title.name !== '' && title.name !== undefined && title.name !== null) {
          return COLOR_LEFT_HALF_TITLE
        } else if (title.titleGroup !== '' && title.titleGroup !== undefined && title.titleGroup !== null) {
          return COLOR_RIGHT_HALF_TITLE
        }
      }
      return q.color
    },
    getCellColorByType(type) {
      if (type === 'title') {
        return CELL_COLOR_TITLE
      } else if (type === 'sid') {
        return CELL_COLOR_SID
      } else {
        return CELL_COLOR_USELESS
      }
    },
    toStep(from, to) {
      switch (to) {
        case 1:
          this.activeStep = 0
          break
        case 2: {
          if (this.importTable.length > 1 || (!this.importDataHasHead && this.importTable.length > 0)) {
            if (from === 1) this.renderSettingsPage()
            this.activeStep = 1
            break
          } else {
            this.$message({
              message: '您首先需要引入数据',
              type: 'warning'
            })
            break
          }
        }
        case 3: {
          let legalRequest = true
          const previewPermission = [
            {
              validator: this.settingsPageData.titles && this.settingsPageData.dataset,
              action: () => {},
              reject: () => {
                legalRequest = false
                this.$message({
                  message: '您需要在第一步先引入数据',
                  type: 'warning'
                })
              }
            },
            {
              validator: this.settingsAlertList.length === 0,
              action: () => {},
              reject: () => {
                legalRequest = false
                this.$message({
                  message: '请确认您已经排除了所有错误项',
                  type: 'error'
                })
              }
            }
          ]
          previewPermission.forEach(rule => {
            rule.validator ? rule.action() : rule.reject()
          })

          if (legalRequest) {
            this.activeStep = 2
            this.renderPreviewPage()
          }
          break
        }
      }
    },
    renderSettingsPage() {
      Object.assign(this.$data.settingsPageData, {})
      this.settingsPageData = hotToElementAdapter(this.importTable, this.importDataHasHead)
    },
    renderPreviewPage() {
      // console.log(this.settingsPageData)
      this.previewPageData = {}
      this.previewPageData = previewFilter(this.settingsPageData)
      // console.log(this.previewPageData)
    },
    fetchLesson() {
      lessonViewModel.requestAllLessons().then(res => {
        this.remoteLessonList = res
      })
    },
    fetchTitleGroup(id) {
      titleGroupViewModel.requestByLessonId(id).then(list => {
        this.remoteTitleGroupList = list
      }).catch(err => {
        console.error(err)
        this.$message({
          message: err,
          type: 'error'
        })
      })
    },
    // listners
    submit() {
      const submitDataset = submitConverter(this.previewPageData, this.remoteLesson)
      pointViewModel.requestImportPoints(submitDataset).then(res => {
        if ((res && String(res.code) === '2011') || (res && String(res.code) === '2001')) {
          console.log('数据导入成功')
          this.$message({
            message: '数据导入成功',
            type: 'success'
          })
        } else if (res && String(res.code) === '2019') {
          console.log('数据导入失败')
          this.$message({
            message: '数据已经导入, 部分数据存在冲突',
            type: 'warning'
          })
          this.handleSubmitFeedback(res)
        } else {
          console.log('数据导入失败')
          this.$message({
            message: '数据导入失败,请查看错误信息',
            type: 'error'
          })
          this.handleSubmitFeedback(res)
        }
      })
    },
    onSelectedLocalExcel(data) {
      // console.log(data.results)
      this.$refs.hotTable.hotInstance.loadData(xlsxToHotAdapter(data.results))
    },
    onTitleTypeClick(title, type) {
      this.handleTitleTypeChange(title, type)
    },
    onSelectedLesson(selected) {
      this.fetchTitleGroup(selected)
    },
    handleTitleTypeChange(title, type) {
      title.type = type
    },
    handleSubmitFeedback(response) {
      const errorList = response.subjects

      const title_list = errorList['error_title_names'] || []
      // deleted duplicated
      this.submitErrorMessage.errorTitleNameList = Array.from(new Set(title_list))
      this.submitErrorMessage.existTitleNameListt = errorList['exists_title_names'] || []
      this.submitErrorMessage.existPointList = errorList['exists_point_message'] || []
      this.submitErrorMessage.errorPointList = errorList['error_point_message'] || []
      console.log(this.submitErrorMessage)
    },
    getStudentNumber(scope) {
      return this.previewPageData.sid[scope.$index]
    },
    getTitleGroup(titleGroup_id) {
      return this.remoteTitleGroupList.find(item => item.id === titleGroup_id)
    }
  },
  created() {
    this.$store.dispatch('saveImportTable', { table: [] })
    this.fetchLesson()
  }
}
</script>

<style lang="scss">
@import '../../../node_modules/handsontable/dist/handsontable.full.min.css';
</style>

<style lang="scss" scoped>
.flex-half {
  float: left;
  width: 50%;
  background: white;
}
.flex-70 {
  float: left;
  width: 70%;
  background: white;
}
.flex-30 {
  float: left;
  width: 30%;
  background: white;
}
.steps {
  background: white;
  padding: 1em;
  height: 150px;
  box-sizing: border-box;
}

#import-menu-table-board {
  .alert{
    margin: 8px 12px
  }
}

.content-wrapper {
  display: block;
}

.table-wrapper {
  max-width: 55%;
}

.menu-continue {
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 12px;
  * {
    margin: 0 12px 0 0;
  }

  .button {
    background: #4caf50
  }
}

.el-table th div {
  padding: 0px;
}

.settings-table-header {
  margin-left: -4px;
  display: flex;
  flex-flow: row;
  justify-content: start;
  align-items: center;
  min-height: 50px;
  max-height: 100px;
}

.hidden-selector {
  left: -40px;
  top: -20px;
  float: right top;
  width: 0px;
  height: 0px;
  display: hidden;
  box-sizing: border-box;
}

.selector-for-hidden-selector {
  display: block;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 4px solid #665;
  box-shadow: 0px 0px 0px transparent;
  margin: 2px;
  transition: 0.4s ease-in;
  &:hover {
    border: 0px solid #212121;
    box-shadow: 1px 1px 2px 2px rgba(0,0,0,.5);
    transition: 0.4s ease-in;
  }

  // & div {
  //   border-radius: 999px;
  //   width: 24px;
  //   height: 24px;
  // }
}
.preivew-table {
  margin: 20px;
  width: calc(100% - 40px);
  border: 10px solid #EEE;
}
</style>

<!-- override element-ui switch button active style -->
<style>
#menu-continue-switch-btn .el-switch__label * {
  color: #BBB;
}
#menu-continue-switch-btn .el-switch__label.is-active * {
  color: #212121;
}
.el-tabs__header.is-hidden {
  display: none;
}

.title-name .el-input__inner {
  min-width: 40px;
  padding: 0 0 0 4px ;
}

.title-name .el-input {
  min-width: 40px;
  padding: 0 0 0 4px ;
}

.settings-table-header .el-button {
  min-width: 20px;
  padding: 2px 4px;
  margin: 1px;
}
.settings-table-header .el-button span {
  font-size: 6px;
}

#settings-table td {
  padding: 0px;
  border: none;
}
#settings-table td .cell{
  padding: 0px;
  border: none;
}
#settings-table td .setting-table-cell {
  /* background: #DDD; */
  border: none;
}
#settings-table .el-input__inner {
  border: none;
  background: transparent;
}
</style>
