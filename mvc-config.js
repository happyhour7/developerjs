module.exports={
  defaultActionName:"index",
  routerType:{
      'todolist/index':'pjax',
      'todolist':'pjax'
  },
  ajax:{
      'todolist/getlist':['这是我的list','这是我的list','这是我的list','这是我的list','这是我的list','这是我的list','这是我的list','这是我的list'],
      'todolist/getlist2':{
      		ajaxRepeat:3,
      		ajaxData:{one:'one',two:'two',three:'three'}
      }
      	
  }
};
