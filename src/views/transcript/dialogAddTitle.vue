<template>
  <el-dialog title="添加新的列项" :visible.sync="visible" :before-close="onDialogClose">
  <el-form :rules="rules":model="titleForm" ref="form">
    <el-form-item label="新列名称" prop="name" >
      <el-input v-model="titleForm.name" autoComplete="off"></el-input>
    </el-form-item>
    <el-form-item label="所属类别" prop="titleGroup_id">
      <el-select v-model="titleForm.titleGroup_id" placeholder="请选择小项所属的分数类别">
        <el-option v-for='titleGroup in titleGroupList' :key='titleGroup.id'
          :label='titleGroup.name' :value='titleGroup.id'>
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="onDialogClose">取 消</el-button>
    <el-button type="primary" @click="onAddNewTitle('form')">确 定</el-button>
  </div>
</el-dialog>
</template>

<script>
import titleGroupViewModel from '@/viewmodel/titlegroups'

const titlePrototype = {
  name: '',
  titleGroup_id: null,
  classInfo_id: null,
  weight: 0
}

export default {
  props: ['visible', 'classInfo'],
  data() {
    return {
      titleForm: titlePrototype,
      titleGroupList: [],
      rules: {
        name: [
          { required: true, message: '请输入学生姓名', trigger: 'blur' }
        ],
        titleGroup_id: [
          { required: true, message: '请选择小项所属的分数类别', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    onDialogClose: function() {
      // reset cell_copy and validator
      this.$refs.form.resetFields()
      this.$emit('onDialogClose', false)
    },
    onAddNewTitle: function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.titleForm['classInfo_id'] = this.classInfo.id
          this.$emit('onAddNewTitle', JSON.parse(JSON.stringify(this.titleForm)))
          this.onDialogClose()
        } else {
          return false
        }
      })
    },
    fetchTitleGroupList: function() {
      // TODO: Add request params
      const lessonId = this.classInfo && this.classInfo.lesson_id || 1
      console.log(this.classInfo)
      titleGroupViewModel.requestTitleGroups({ lesson_id: lessonId }).then(list => {
        this.titleGroupList = list
      }).catch(err => {
        console.error(err)
        this.$message({
          message: err,
          type: 'error'
        })
      })
    }
  },
  created() {
    this.fetchTitleGroupList()
  }
}
</script>

<style>

</style>
