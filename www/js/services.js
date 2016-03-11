angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.service('goBackMany',function($ionicHistory){
  //might be useful in future
  return function(depth){
    // get the right history stack based on the current view
    var historyId = $ionicHistory.currentHistoryId();
    var history = $ionicHistory.viewHistory().histories[historyId];
    // set the view 'depth' back in the stack as the back view
    var targetViewIndex = history.stack.length - 1 - depth;
    $ionicHistory.backView(history.stack[targetViewIndex]);
    // navigate to it
    console.log($ionicHistory);
    $ionicHistory.goBack();
  }
});
