/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  .controller('invListCtrl', function($scope, $stateParams, $http, $q, $ionicLoading, $state, PelApi, appSettings) {
    $scope.parse = function(data) {
      var mapped = [];
      data.forEach(function(item) {
        var docsGroups = _.get(item, "DOCUMENTS.DOCUMENTS_ROW", [])
        docsGroups.forEach(function(g) {
          var task;
          try {
            task = JSON.parse(_.get(g, "MESSAGE", "{}"));
          } catch (e) {
            task = {}
            PelApi.lagger.error("Failed to parse  JSON  string on docsGroup ")
          }
          g.TASK = _.get(task, "ROW.ROW", {});
        })
        mapped.push(item)
      });
      return mapped;
    }

    //----------------------- REFRESH ------------------------//
    $scope.doRefresh = function() {

      PelApi.showLoading();
      $scope.appId = $stateParams.AppId;
      $scope.formType = $stateParams.FormType;
      $state.pin = $stateParams.Pin;

      var links = PelApi.getDocApproveServiceUrl("GtUserFormGroups");

      var retGetUserFormGroups = PelApi.GetUserFormGroups(links, $scope.appId, $scope.formType, $state.pin);
      var srvData = {};
      retGetUserFormGroups.success(function(data) {
          var apiData = PelApi.checkApiResponse(data);
          var result = apiData.ROW || [];
          //Cursor if empty
          if (result.length && result[0].DOC_NAME === null) {
            PelApi.appSettings.config.IS_TOKEN_VALID = 'N'
            PelApi.goHome();
          }
          $scope.docsGroups = $scope.parse(result);
          if ($scope.docsGroups.length) {
            $scope.title = $scope.docsGroups[0].DOC_TYPE;
          }
        })
        .error(function(error, httpStatus) {
          PelApi.throwError("api", "GetUserNotifNew", "httpStatus : " + httpStatus)
        })
        .finally(function(skip) {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.forwardToDoc = function(docId, docInitId, notificationId) {

      var statePath = 'app.inv_details';

      $state.go(statePath, {
        formType: $scope.formType,
        appId: $scope.appId,
        docId: docId,
        docInitId: notificationId
      });
    }

    $scope.feed = [];
    $scope.searchText = "";
    $scope.doRefresh();

  });