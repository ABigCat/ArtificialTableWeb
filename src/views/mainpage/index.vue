<!-- Tree Structure of Mainpage -->
<!--
div(mainpage)
    |- DONE: welcome card
    |- TODO: class list
        |- TODO: semester selected list
        |- DONE: semester list
            |- DONE: class list inside
-->
<template>
  <div>
    <header class="at-card at-card-shadow header">
        <div><!-- 区域1 -->
        </div>
        <at-avatar></at-avatar>
        <div><!-- 区域3 -->
        </div>
        <div class="info-card" v-for="item in this.infos_arrays" :key="item.hint">
          <p>
            <svg-icon :icon-class="item.icon" v-bind:style="{fill:item.color}"></svg-icon>
            <span class="hint">{{item.hint}}</span>
          </p>
          <p><span class="content">{{item.content}}</span></p>
        </div>
      </header>
    <!-- <at-semester
      class="semester"
      v-for="(item, index) in semeseterDataset" :key="index"
      :dataset="item"
      >
        {{index}} 学期
    </at-semester> -->
    <div class="frame">
      <span style="padding-left: 10px;">选择学期：</span>
      <el-select 
        @change="getCardBySemester"        
        v-model="selectedSemester">
        <el-option
          v-for="(item, idx) of semeseterDataset"
          :key="idx"
          :value="idx"
          :label="idx">
        </el-option>
      </el-select>
      <el-button @click="currentFilter" style='margin-left:10px;'>当前学期</el-button>
      <el-button @click="restFilter">重置筛选</el-button>
    </div>
    <transition name="fade" mode="out-in">
      <div id="at-m-list-container" class="at-collapsible" v-show="shown">
        <at-class-card
          :key="item.id"
          v-for="item in this.shownFilterBySemester"
          :dataset="item">
          </at-class-card>
      </div>
    </transition>
  </div>
</template>

<script>
import AtSemester from '@/components/Mainpage/Semester'
import AtAvatar from '@/components/Avatar'
import AtClassCard from '@/components/Mainpage/ClassCard'

import classInfoViewmModel from '@/viewmodel/classinfos'
import { mapGetters } from 'vuex'

// const indigo = ''
const cyan = '#00BCD4'
const blue = '#2196F3'
const green = '#4CAF50'
// const light_green = '#4CAF50'

export default {
  components: {
    'AtSemester': AtSemester,
    'AtClassCard': AtClassCard,
    'AtAvatar': AtAvatar
  },
  computed: {
    ...mapGetters([
      'user',
      'id',
      'is_manager'
    ]),
    getUniName() {
      return this.user.university_message.name
    },
    getSchName() {
      return this.user.college_message.name
    },
    getManager() {
      return this.is_manager ? '管理员' : '教师'
    }
  },
  data() {
    return {
      user_info: this.user,
      shown: false,
      infos_arrays: [
        { icon: 'domain', color: cyan, hint: '学校 / 机构', content: null },
        { icon: 'school', color: blue, hint: '院系', content: null },
        { icon: 'user', color: green, hint: '认证', content: null }
      ],
      selectedSemester: null,
      shownFilterBySemester: [],
      semeseterDataset: {} // A dictionary, integrate class by semester
    }
  },
  methods: {
    restFilter: function() {
      this.selectedSemester = null
      const ll = []
      Object.keys(this.semeseterDataset).forEach((semester, idx) => {
        ll.push(...this.semeseterDataset[semester])
      })
      this.shownFilterBySemester = ll
    },
    currentFilter: function() {
      for (const idx in this.semeseterDataset) {
        const item = this.semeseterDataset[idx]
        if (item && item[0]) {
          this.selectedSemester = item[0]['current_semester']
          console.log(item)
          break
        }
      }
      if (this.selectedSemester && this.selectedSemester.length > 0) {
        this.shownFilterBySemester = this.semeseterDataset[this.selectedSemester]
      } else {
        const ll = []
        Object.keys(this.semeseterDataset).forEach((semester, idx) => {
          ll.push(...this.semeseterDataset[semester])
        })
        this.shownFilterBySemester = ll
      }
    },
    buildSemester: function(allClass) {
      for (const eachClass of allClass) {
        if (!this.semeseterDataset[eachClass['semester']]) {
          this.$set(this.semeseterDataset, eachClass['semester'], [eachClass])
        } else {
          this.semeseterDataset[eachClass[['semester']]].push(eachClass)
        }
      }
      this.getCardBySemester()
    },
    getCardBySemester() {
      this.shown = false
      if (this.selectedSemester && this.selectedSemester.length > 0) {
        this.shownFilterBySemester = this.semeseterDataset[this.selectedSemester]
      } else {
        const ll = []
        Object.keys(this.semeseterDataset).forEach((semester, idx) => {
          ll.push(...this.semeseterDataset[semester])
        })
        this.shownFilterBySemester = ll
      }
      this.shown = true
    },
    fetchClassInfos: function() {
      classInfoViewmModel
        .requestClassInfos({ teacher_id: this.id })
        .then(responseArray => {
          try {
            this.buildSemester(responseArray)
          } catch (exception) {
            console.error(exception)
          }
        })
    }
  },
  created() {
    this.fetchClassInfos()
  },
  mounted() {
    this.$set(this.infos_arrays, 0, { icon: 'domain', color: cyan, hint: '学校 / 机构', content: this.getUniName })
    this.$set(this.infos_arrays, 1, { icon: 'school', color: blue, hint: '院系', content: this.getSchName })
    this.$set(this.infos_arrays, 2, { icon: 'user', color: green, hint: '认证', content: this.getManager })
  }
}
</script>

<style lang="scss" scoped>
$grey: #999;
$black: #212121;
$white: #FFF;

.header {
  display: flex;
//   flex-direction: row;
//   flex-wrap: wrap;
    flex-flow: row wrap;
    justify-content: center;
    align-content: space-between;
    align-items: flex-start;

//   & * {
//       flex: 1 1 auto;
//   }

  & > :first-child,& > :nth-child(3){
    width: 30%;
  }

  & > :nth-child(2){
    width: 40%;
  }
}

.info-card{
    flex-flow: column nowrap;
    min-width: 250px;
    max-width: 400px;
    margin: 12px;
    padding: 8px;
    .svg-icon {
        width: 24px;
        height: 24px;
    }
    p {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        margin: 0;
        .hint {
            margin-left: 4px;
            display: inline-block;
            color: $grey;
            font-size: 0.9em;
            vertical-align: middle;
            text-anchor: middle;
            line-height: 100%;
        }
    }
    p ~ p{
        // padding-left: 24px;
        margin-left: 28px;
   }

  transition: 1s 0.2s cubic-bezier(0.895, 0.03, 0.685, 0.22);
  &:hover{
    background: $black;
    color: $white;
    border-radius: 2px;
    box-shadow: 0 19px 38px rgba(0,0,0,0.30),
                0 15px 12px rgba(0,0,0,0.22);
    position: relative;
  };
}


.at-card-shadow {
    transition: 10s;
    :hover{
        transition: 0.2s;
    }
}

.semester{
  margin-top: 1rem;
  margin: 2rem;
}

.frame {
  padding: 0.3rem;
  background: #FFF;
  border-top: #EEE solid 5px;
}
</style>
