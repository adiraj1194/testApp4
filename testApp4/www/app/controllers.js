﻿(function () {
    "use strict";
    //var host = "http://paatshaalamobileapi-prod.us-west-2.elasticbeanstalk.com/";
    // var host = "http://192.168.29/SampleAPI/";
    var host = "http://192.168.1.43/SampleAPI/";
    //var host = "http://192.168.1.34/SampleAPI/";
    //var host = 'http://localhost:56623/';
    angular.module("myapp.controllers", ['ionic-datepicker', 'tabSlideBox'])

    .controller("appCtrl", ["$scope", function ($scope) {
    }])
    .controller('loginCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', '$ionicHistory', function ($scope, $http, $CustomLS, $ionicLoading, $state, $ionicHistory) {
        $scope.loginData = {};
        $scope.message = "";
        $scope.newUser = function () {
            $state.go('view-SendVerificationCode');
        };
        $scope.forgetPassword = function () {
            $state.go('view-forgetPassword');
        }
        $scope.EmployeeForgetPassword = function () {
            $state.go('view-employeeForgetPassword');
        }
        $scope.login = function () {
            if ($scope.loginData.Usertype == 'Employee') {
                $ionicLoading.show({ template: '<ion-spinner icon="spiral"></ion-spinner>', duration: 10000 });
                $http.post(host + 'User/EmployeeLogin', $scope.loginData).success(function (data) {
                    debugger;
                    if (data.Status) {
                        localStorage['LoginType'] = 'Employee';
                        $CustomLS.setObject('LoginUser', data.User);
                        $CustomLS.setObject('currentStudents', data.HasStudents);
                        localStorage['token'] = data.Token;
                        $state.go('view-Employee-home');
                    }
                    else {
                        $scope.message = data.Message;
                    }
                    $ionicLoading.hide();
                }).error(function (errData) {
                    console.log(errData);
                    $ionicLoading.hide();
                });
            }
            else {
                $ionicLoading.show({ template: 'Login...', duration: 10000 });
                $http.post(host + 'User/Login', $scope.loginData).success(function (data) {
                    if (data.Status) {
                        if (data.HasStudents.length == 0) {
                            alert('No children tagged to the mail Id ' + data.User.Username);
                        }
                        else {
                            localStorage['LoginType'] = 'Parent';
                            $CustomLS.setObject('LoginUser', data.User);
                            $CustomLS.setObject('currentStudents', data.HasStudents);
                            localStorage['token'] = data.Token;
                            $scope.values = $CustomLS.getObject('currentStudents');

                            $scope.selectStudent = data.HasStudents[0];
                            localStorage['selectedStudent'] = $scope.selectStudent.Id;
                            localStorage['selectedStudentBatch'] = $scope.selectStudent.Batch;
                            localStorage['selectedStudentCourse'] = $scope.selectStudent.Course;
                            localStorage['selectedStudentOrgId'] = $scope.selectStudent.OrgId;
                            $state.go('view-parent-home');
                        }
                    }
                    else {
                        $scope.message = data.Message;
                    }
                    $ionicLoading.hide();
                }).error(function (errData) {
                    console.log(errData);
                    $ionicLoading.hide();
                });
            }
        }
    }])
    .controller('settingCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', function ($scope, $http, $CustomLS, $ionicLoading, $state) {
        $scope.AppCurrentVersion = localStorage['AppCurrentVersion'];
        $scope.AppToken = localStorage['token'];
        $scope.logout = function () {
            localStorage.clear();
            $state.go('login');
        };
    }])
    .controller('changeStudentCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', function ($scope, $http, $CustomLS, $ionicLoading, $state) {
        $scope.currentStudents = $CustomLS.getObject('currentStudents', []);
        $scope.data = {
            student: localStorage['selectedStudent']
        };
        $scope.changeStudent = function () {
            localStorage['selectedStudent'] = $scope.data.student;
            $scope.studentCurrent = $scope.currentStudents.find(function (f) { return f.Id == $scope.data.student });
            localStorage['selectedStudentBatch'] = $scope.studentCurrent.Batch;
            localStorage['selectedStudentCourse'] = $scope.studentCurrent.Course;
            localStorage['selectedStudentOrgId'] = $scope.studentCurrent.OrgId;

        };
    }])
    .controller('manageChildrenCtrl', ['$scope', '$http', '$CustomLS', '$ionicLoading', '$state', function ($scope, $http, $CustomLS, $ionicLoading, $state) {
        $scope.user = $CustomLS.getObject('loginUser');
        $scope.courses = []
        $scope.batches = [];
        $scope.students = [];

        $scope.data = {};
        $scope.currentStudents = $CustomLS.getObject('currentStudents', []);
        $scope.addSelectedStudents = function () {
            $scope.students.find(function (s) { return s.selected; });
            $scope.students.forEach(function (v, i) {
                if (v.selected & $scope.currentStudents.find(function (s) { return s.Id == v.Id; }) == undefined) {
                    $scope.currentStudents.push(v);
                }
            });
            $CustomLS.setObject('currentStudents', $scope.currentStudents);
        };
        $scope.deleteStudent = function (student) {
            $scope.currentStudents = $scope.currentStudents.filter(function (s) { return s.Id != student.Id });
            $CustomLS.setObject('currentStudents', $scope.currentStudents);
        };
    }])

    //homeCtrl provides the logic for the home screen
    .controller("homeCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {


        $scope.goAfterLogin = function (data) {


        }
        $scope.goRegister = function () {
            $state.go('register');
        }
        $scope.forgotPass = function () {
            $state.go('view-forgetPassword');
        }
        $scope.parentHome = function () {
            $state.go('view-parent-home');
        }

    }])
       .controller("registerCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {

           $http.get(host + '/School/GetAll').then(function (res) {
               debugger;
               console.log(res);
               $scope.SchoolList = res.data;
           });

       }])
        .controller("SendVerificationCodeCtrl", ["$scope", "$state", "$ionicLoading", "$http", "$ionicPopup", "$CustomLS", function ($scope, $state, $ionicLoading, $http, $ionicPopup, $CustomLS) {
            $scope.sendVerificationCode = function (data) {
                $ionicLoading.show({ template: 'Sending Verification Code...', duration: 10000 });
                $CustomLS.setObject('UserRegistration', data);
                $http.post(host + 'ParentRegistration/SendEmailVerificationCode', { 'Email': data.email }).success(function (data) {
                    debugger;
                    $ionicLoading.hide();
                    if (data.status) {
                        $state.go('view-PassCode');
                    }
                    else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Invalid',
                            template: data.Message,
                        });
                    }
                })
            }
        }])
         .controller("PassCodeCtrl", ["$scope", "$state", "$ionicLoading", "$http", "$ionicPopup", "$CustomLS", function ($scope, $state, $ionicLoading, $http, $ionicPopup, $CustomLS) {
             $scope.UserRegistration = $CustomLS.getObject('UserRegistration', []);
             $scope.verify = function (data) {
                 debugger;
                 $ionicLoading.show({ template: 'Verifing...', duration: 10000 });
                 $http.post(host + '/ParentRegistration/VerifyCode', { 'Email': $scope.UserRegistration.email, 'Passcode': data.passcode }).success(function (data) {
                     $ionicLoading.hide();
                     if (data.status) {
                         $state.go('ChangePassword');
                     }
                     else {
                         var alertPopup = $ionicPopup.alert({
                             title: 'Invalid',
                             template: data.Message,
                         });
                     }
                 })
             }
         }])
         .controller("ChangePasswordCtrl", ["$scope", "$state", "$http", "$CustomLS", "$ionicPopup", function ($scope, $state, $http, $CustomLS, $ionicPopup) {
             $scope.user = $CustomLS.getObject('UserRegistration');
             $scope.changePassword = function (data) {
                 if (data.password == data.repeatPassword) {
                     $http.post(host + '/ParentRegistration/SavePassword', { 'Email': $scope.user.email, 'Password': data.password }).success(function (data) {
                         debugger;
                         if (data.status) {
                             //   $CustomLS.setObject('StudentLocalStorage', data.Students);
                             //$CustomLS.setObject('currentStudents', data.Students);
                             //$scope.values = $CustomLS.getObject('currentStudents');
                             //$scope.selectStudent = $scope.values[0];
                             //localStorage['selectedStudent'] = $scope.selectStudent.Id;
                             //localStorage['selectedStudentBatch'] = $scope.selectStudent.Batch;
                             //localStorage['selectedStudentCourse'] = $scope.selectStudent.Course;
                             //localStorage['selectedStudentOrgId'] = $scope.selectStudent.OrgId;
                             $state.go('login');
                         }
                     })
                 }
             }
         }])
        .controller("afterLoginCtrl", ["$scope", "$state", function ($scope, $state) {

        }])
         .controller("parentForgetPasswordCtrl", ["$scope", "$state", "$http", "$ionicPopup", "$CustomLS", "$ionicLoading", function ($scope, $state, $http, $ionicPopup, $CustomLS, $ionicLoading) {
             $scope.message = "";
             $scope.sendPassword = function (data) {
                 $ionicLoading.show({ template: 'Sending...', duration: 10000 });
                 $http.post(host + 'ForgetPassword/getPassword', { Email: data.email }).success(function (data) {
                     $ionicLoading.hide();
                     if (data.status) {
                         var alertPopup = $ionicPopup.alert({
                             title: 'Success',
                             template: 'Password Sent Your Mail'
                         });
                         $state.go('login');
                     }
                     else {
                         var alertPopup = $ionicPopup.alert({
                             title: 'Invalid',
                             template: data.Message
                         });
                     }
                 });
             }
         }])
        .controller("employeeForgetPasswordCtrl", ["$scope", "$state", "$http", "$ionicPopup", "$CustomLS", "$ionicLoading", function ($scope, $state, $http, $ionicPopup, $CustomLS, $ionicLoading) {
            $scope.sendEmployeePassword = function (data) {
                $ionicLoading.show({ template: 'Sending...', duration: 10000 });
                $http.post(host + 'ForgetPassword/getEmployeePassword', { Email: data.email, OrgName: data.OrgName }).success(function (data) {
                    $ionicLoading.hide();
                    if (data.status) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Success',
                            template: 'Password Sent Your Mail'
                        });
                        $state.go('login');
                    }
                    else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Invalid',
                            template: data.Message
                        });
                    }
                })
            }
        }])
        .controller("getNewPasswordCtrl", ["$scope", "$state", function ($scope, $state) {

        }])
        .controller("TrackStudentCtrl", ["$scope", "$state", "$ionicLoading", "$http", function ($scope, $state, $ionicLoading, $http) {
            $scope.map = {};
            $scope.RouteCode = [];
            $scope.selected = {};
            $scope.locationData = {};
            $http.post(host + '/GeoLocation/GetRouteCode', { 'OrgId': localStorage['selectedStudentOrgId'] }).success(function (data) {
                $scope.RouteCode = data;
            })

            $scope.getRouteLocation = function () {
                $ionicLoading.show({ template: 'Loading ' });
                $http.get(host + 'GeoLocation/ShowLocation?OrgId=' + localStorage['selectedStudentOrgId'] + '&Routecode=' + $scope.selected.Route).success(function (data) {//localStorage['selectedStudentOrgId']+, { OrgId: localStorage['selectedStudentOrgId'], Routecode: $scope.selected.Route }
                    $ionicLoading.hide();
                    $scope.locationData = data;
                    $scope.map.setCenter(new google.maps.LatLng(data.Latitude, data.Longitude));

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(data.Latitude, data.Longitude),
                        map: $scope.map,
                        title: 'Route No: ' + $scope.selected.Route
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        infowindow.open($scope.map, marker);
                    });

                }).error(function (err) {
                    $ionicLoading.hide();
                    alert("Error Getting Location")
                });
            };

            var mapOptions = {
                center: new google.maps.LatLng(43.07493, -89.381388),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);



        }])
         .controller("parentHomeCtrl", ["$scope", "$state", "$ionicPopover", '$ionicHistory', '$ionicNavBarDelegate', '$cordovaAppVersion', '$http', '$ionicPopup', function ($scope, $state, $ionicPopover, $ionicHistory, $ionicNavBarDelegate, $cordovaAppVersion, $http, $ionicPopup) {
             $scope.Pages = [
             {
                 "Name": "Fee Details", "Href": "#/view-feeDeatils", "Icon": "ion-card"
             },
             {
                 "Name": "Subject Details", "Href": "#/view-subject-details", "Icon": "ion-ios-book"
             },
             //{
             //    "Name": "Transport Facilty", "Href": "#/view-transportFacility", "Icon": "ion-android-bus"
             //},
             //{
             //    "Name": "Hostel Details", "Href": "#/view-hostelDetails", "Icon": "ion-ios-home"
             //},
             {
                 "Name": "Student Details", "Href": "#/view-studentDetail", "Icon": "ion-android-person"
             },
             {
                 "Name": "Homework Details", "Href": "#/view-HomeWork-Details", "Icon": "ion-printer"
             },
             {
                 "Name": "Holidays", "Href": "#/view-holidays", "Icon": "ion-android-bicycle"
             },
             {
                 "Name": "Message Box", "Href": "#/view-MessageBox", "Icon": "ion-android-chat"
             },
             {
                 "Name": "Time Table", "Href": "#/view-TimeTable", "Icon": "ion-android-clipboard"
             },
             {
                 "Name": "Exam Details", "Href": "#/view-ExaminationDetails", "Icon": "ion-ios-book-outline"
             },
             {
                 "Name": "Teacher Details", "Href": "#/view-teacherDetail", "Icon": "ion-person"
             },
             {
                 "Name": "Assesment Report", "Href": "#/view-assesmentReport", "Icon": "ion-ribbon-a"
             },
               {
                   "Name": "Track Student", "Href": "#/view-trackstudent", "Icon": "ion-location"
               },
             // {
             //     "Name": "Bar Code Scanner", "Href": "#/barCodeScanner", "Icon": "ion-qr-scanner"
             // },
             //{
             //    "Name": "Geo Location", "Href": "#/Geolocation", "Icon": "ion-location"
             //}
             ];
             $scope.NewVersionData = {};
             document.addEventListener("deviceready", function () {
                 $cordovaAppVersion.getVersionNumber().then(function (version) {
                     localStorage['AppCurrentVersion'] = version;
                     alert(version);
                     $http.get(host + 'AppManager/GetLatestVersion').success(function (data) {
                         debugger;
                         $scope.NewVersionData = data;
                         $scope.NewVersionData.Url = host + "AppManager/PatashalaApp";
                         console.log(data);
                         if (data.Version != version) {
                             $ionicPopup.alert({
                                 title: 'New Update Available!',
                                 template: "<strong>New Version : </strong> {{NewVersionData.Version}} <br />  <a href=\"#\" onclick=\"window.open('" + $scope.NewVersionData.Url + "', '_system', 'location=yes'); return false;\"> Get from here</a><br /> {{NewVersionData.UpdateMessage}}",
                                 scope: $scope
                             });
                         }
                     });
                 });



             }, false);

             if (localStorage['tokenType'] == "NEW") {
                 var userId = JSON.stringify(localStorage['LoginUser']).UserId;
                 $http.post(host + 'User/UpdateToken', { UserId: userId, SenderId: localStorage['token'] }).success(function (data) {
                     localStorage['tokenType'] == "UPDATED";
                 });
             }

             $scope.submitEmail = function () {
                 $state.go('view-subject-details');
             }
             $ionicPopover.fromTemplateUrl('my-popover.html', {
                 scope: $scope
             }).then(function (popover) {
                 $scope.popover = popover;
             });




         }])
        .controller("employeeHomeCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
            $scope.Pages = [

         {
             "Name": "Transport ", "Href": "#/Transport", "Icon": "ion-qr-scanner"
         },
           {
               "Name": "Attendance", "Href": "#/Attendance", "Icon": "ion-qr-scanner"
           },

         {
             "Name": "Geo Location", "Href": "#/Geolocation", "Icon": "ion-location"
         },
            {
                "Name": "Holidays", "Href": "#/Employeeholidays", "Icon": "ion-android-bicycle"
            },
            {
                "Name": "Personal Details", "Href": "#/EmployeeProfile", "Icon": "ion-android-person"
            },
             {
                 "Name": "Gallery", "Href": "#/EmployeeGallery", "Icon": "ion-images"
             },
              {
                  "Name": "Attendance Entry", "Href": "#/EmployeeAttendance", "Icon": "ion-ios-people"
              },
             {
                 "Name": "Enquiry Form", "Href": "#/EnquiryForm", "Icon": " ion-card"
             },
            {
                "Name": "Settings", "Href": "#/EmployeeSettings", "Icon": "ion-android-settings"
            }
            ];
        }])
         .controller("subjectDetailCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
             var studentId = localStorage['selectedStudent'];
             $http.post(host + '/Subjects/GetAllByStudent', { StudentId: studentId }).success(function (data) {
                 debugger;
                 $scope.SubjectDetail = data;
             });
         }])
        .controller("feeDetailCtrl", ["$scope", "$state", "$http", "$ionicLoading", '$CustomLS', function ($scope, $state, $http, $ionicLoading, $CustomLS) {
            var studentId = localStorage['selectedStudent'];
            $scope.student = $CustomLS.getObject('currentStudents').find(function (f) { return f.Id == studentId });
            $scope.feeDetails = [];
            $ionicLoading.show({ template: 'Loading Fee Details...' });
            $http.post(host + 'FeeDetail/GetByStudent', { StudentId: studentId }).success(function (data) {
                $scope.feeDetails = data;
                $ionicLoading.hide();
            });

        }])
        .controller("attendenceCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {
            debugger;
            $http.get(host + '/Subjects/GetAllByStudent?StudentId=10111').then(function (res) {
                debugger;
                console.log(res);
                $scope.SubjectDetail = res.data;
            });

        }])
         .controller("nextEmployeeAttendanceCtrl", ["$scope", "$state", "$http", "$CustomLS", "$stateParams", function ($scope, $state, $http, $CustomLS, $stateParams) {
             debugger;
             $scope.dropdownValues = [
              { Name: 'Present', Id: true },
              { Name: 'Absent', Id: false }]
             $scope.dropdown = {};
             $scope.data = {};
             $scope.BackupStudentsList = {};
             $scope.user = $CustomLS.getObject('LoginUser');
             $scope.BatchId = $stateParams.BatchId;
             $scope.CourseId = $stateParams.CourseId;
             $scope.Date = $stateParams.Date;
             $http.post(host + '/Attandance/getStudentsBasedOnFiler', { BatchId: $scope.BatchId, CourseId: $scope.CourseId, OrgId: $scope.user.OrgId }).success(function (data) {
                 $scope.BackupStudentsList = $scope.StudentsList = data;
                 //   $scope.StudentsList = StudentName.all();
                 // $scope.listlength = data;
             });
             $scope.dropvalueChange = function(){
                 console.log($scope.dropdown.value);
                 debugger;
                 if($scope.dropdown.value != "-1")
                 {
                     $scope.StudentsList.forEach(function (e, i) {
                         e.isPresent = $scope.dropdown.value == "0" ? false : true;
                         $scope.BackupStudentsList.filter(function (e2) { return e2.Id == e.Id; })[0].isPresent = e.isPresent;
                     });
                 }
             };
             $scope.searchTextChanged = function ()
             {
                 $scope.StudentsList = $scope.BackupStudentsList.filter(function (e) { return e.StudentName.toUpperCase().indexOf($scope.data.searchText.toUpperCase()) != -1; });
             }
             $scope.SubmittingAttendance = function () {
                 debugger;
                 $scope.StudentsList;
                 $http.post(host + '/Attandance/saveDailyStudentAttendance', { Students: $scope.StudentsList, Date: $scope.Date }).success(function (data) {

                 });
             };

         }])

        .controller("employeeAttendenceCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {

            $scope.selected = {}
            $scope.user = $CustomLS.getObject('LoginUser');
            debugger;
            $http.post(host + '/Attandance/getBatchAndCourse', { OrgId: $scope.user.OrgId }).success(function (data) {
                debugger;
                $scope.Batchlist = data.Batches;
                $scope.CourseList = data.Courses;
            });

            $scope.date = new Date();
            $scope.FormattedDate = $scope.date.toLocaleDateString();
            $scope.setDateTime = function () {
                var ipObj1 = {
                    callback: function (val) {  //Mandatory
                        var date = new Date(val);
                        $scope.date = date;
                        $scope.FormattedDate = date.toLocaleDateString();
                    },
                    inputDate: new Date(),
                    showTodayButton: true,
                    to: new Date(),             //Optional
                    inputDate: new Date(),      //Optional
                    mondayFirst: false,         //Optional
                    closeOnSelect: false,       //Optional
                    templateType: 'popup'      //Optional
                };
                ionicDatePicker.openDatePicker(ipObj1);
            };
            $scope.GiveAttendanceList = function () {
                debugger;

                $state.go('NextEmployeeAttendanceScreen', { BatchId: $scope.selected.Batch, CourseId: $scope.selected.Course, Date: $scope.date });
            };

            //          $http.post(host + '/Subjects/GetAllByStudent?StudentId=10111').then(function (res) {
            //                 console.log(res);
            //                 $scope.Student= res.data;

            //});
            //      $scope.giveAttendanceList = function () {
            //        $state.go('nextEmployeeAttendanceCtrl');
            //};
        }])
         .controller("enquiryFormCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {
             $scope.date = new Date();
             $scope.FormattedDate = $scope.date.toLocaleDateString();
             $scope.setDateTime = function () {
                 var ipObj1 = {
                     callback: function (val) {  //Mandatory
                         var date = new Date(val);
                         $scope.date = date;
                         $scope.FormattedDate = date.toLocaleDateString();
                     },
                     inputDate: new Date(),
                     showTodayButton: true,
                     to: new Date(),             //Optional
                     inputDate: new Date(),      //Optional
                     mondayFirst: false,         //Optional
                     closeOnSelect: false,       //Optional
                     templateType: 'popup'      //Optional
                 };
                 ionicDatePicker.openDatePicker(ipObj1);
             };
             $scope.NextPageEnquiry = function () {
                 debugger;
                 $state.go('NextEnquiryForm');
             };
             $http.get(host + '/School/GetAll').then(function (res) {
                 debugger;
                 console.log(res);
                 $scope.SchoolList = res.data;
             });

         }])
         .controller("nextEnquiryFormCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {

             //$scope.selected = {}
             $scope.user = $CustomLS.getObject('LoginUser');
             debugger;
             $http.post(host + '/Attandance/getBatchAndCourse', { OrgId: $scope.user.OrgId }).success(function (data) {
                 debugger;
                 $scope.Batchlist = data.Batches;
                 $scope.CourseList = data.Courses;
             });
             $scope.date = new Date();
             $scope.FormattedDate = $scope.date.toLocaleDateString();
             $scope.setDateTime = function () {
                 var ipObj1 = {
                     callback: function (val) {  //Mandatory
                         var date = new Date(val);
                         $scope.date = date;
                         $scope.FormattedDate = date.toLocaleDateString();
                     },
                     inputDate: new Date(),
                     showTodayButton: true,
                     to: new Date(),             //Optional
                     inputDate: new Date(),      //Optional
                     mondayFirst: false,         //Optional
                     closeOnSelect: false,       //Optional
                     templateType: 'popup'      //Optional
                 };
                 ionicDatePicker.openDatePicker(ipObj1);
             };
             $http.get(host + '/School/GetAll').then(function (res) {
                 debugger;
                 console.log(res);
                 $scope.SchoolList = res.data;
             });

         }])
         .controller("transportFacilityCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
             var studentId = localStorage['selectedStudent'];
             var OrgId = $CustomLS.getObject('selectedStudentOrgId');
             $http.post(host + '/Transport/GetAllByStudent', { StudentId: studentId, OrgId: OrgId }).success(function (data) {
                 debugger;
                 $scope.TransportDetail = data;
                 $scope.TransportDetail.PickupTime = new Date(data.PickupTime);
                 $scope.TransportDetail.DropTime = new Date(data.DropTime);
             });

         }])
          .controller("hostelDetailsCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {
              debugger;
              $http.get(host + '/Subjects/GetAllByStudent?StudentId=10111').then(function (res) {

                  debugger;
                  console.log(res);
                  $scope.SubjectDetail = res.data;
              });

          }])
            .controller("studentDetailsCtrl", ["$scope", "$state", "$http", '$CustomLS', function ($scope, $state, $http, $CustomLS) {
                var studentId = localStorage['selectedStudent'];
                var OrgId = localStorage['selectedStudentOrgId'];
                debugger;
                $scope.imageUrl = host + "Student/StudentImage?Id=" + studentId;
                $http.post(host + '/PersonalDetail/GetAllDetail', { StudentId: studentId, OrgId: OrgId }).success(function (data) {
                    $scope.PersonalDetail = data;
                });
            }])
          .controller("HomeWorkDetailsCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "$CustomLS", 'ionicDatePicker', function ($scope, $state, $filter, $http, $ionicPopup, $CustomLS, ionicDatePicker) {
              var BatchId = localStorage['selectedStudentBatch'];
              var CourseId = localStorage['selectedStudentCourse'];
              var OrgId = localStorage['selectedStudentOrgId'];
              $scope.date = new Date();
              $scope.FormattedDate = $scope.date.toLocaleDateString();
              //$http.post(host + '/Homework/GetByCourse', { CourseId: CourseId, BatchId: BatchId, OrgId: OrgId }).success(function (data) {
              //    $scope.HomeworkDetail = data;
              //    $scope.HomeworkDetail.assignmentsList.forEach(function (value, index) {
              //        console.log(value.Date);
              //        value.Date = new Date(value.Date);
              //        console.log(value, index);
              //    })
              //});
              $scope.setDateTime = function () {
                  var ipObj1 = {
                      callback: function (val) {  //Mandatory
                          var date = new Date(val);
                          $scope.date = date;
                          $scope.FormattedDate = date.toLocaleDateString();
                      },
                      inputDate: new Date(),
                      showTodayButton: true,
                      to: new Date(), //Optional
                      inputDate: new Date(),      //Optional
                      mondayFirst: false,          //Optional
                      closeOnSelect: false,       //Optional
                      templateType: 'popup'       //Optional
                  };
                  ionicDatePicker.openDatePicker(ipObj1);
              };

              $scope.getHomework = function () {
                  $http.post(host + '/Homework/GetByDate', { CourseId: CourseId, BatchId: BatchId, OrgId: OrgId, Date: $scope.date }).success(function (data) {
                      debugger;
                      $scope.HomeworkDetail = data;
                      $scope.HomeworkDetail.assignmentsList.forEach(function (value, index) {
                          console.log(value.Date);
                          value.Date = new Date(value.Date);
                          console.log(value, index);
                      })
                  })
              };
              $scope.getHomework();
          }])
             .controller("holidaysCtrl", ["$scope", "$state", "$http", '$CustomLS', '$ionicLoading', function ($scope, $state, $http, $CustomLS, $ionicLoading) {
                 var OrgId = localStorage['selectedStudentOrgId'];

                 $ionicLoading.show({ template: "Loading holidays..." });

                 $http.post(host + '/Holiday/GetAll', { OrgId: OrgId }).success(function (data) {
                     $scope.HolidayDetail = data;
                     $ionicLoading.hide();
                     //$scope.HolidayDetail.HolidaysList.forEach(function (value, index) {
                     //    console.log(value.Date); 
                     //    value.Date = new Date(value.Date);
                     //    console.log(value, index);
                     //})
                 });
             }])
            .controller("MessageBoxCtrl", ["$scope", "$state", "$http", function ($scope, $state, $http) {
                debugger;
                $http.get(host + '/Subjects/GetAllByStudent?StudentId=10111').then(function (res) {
                    debugger;
                    console.log(res);
                    $scope.SubjectDetail = res.data;
                });

            }])
          .controller("TimeTableCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
              $scope.periodData = {
                  WeekdayTimeTables: []
              }
              var BatchId = localStorage['selectedStudentBatch'];
              var CourseId = localStorage['selectedStudentCourse'];
              var OrgId = localStorage['selectedStudentOrgId'];
              $scope.loadMore = function () {
                  $http.post('/more-items').success(function (items) {
                      useItems(items);
                      $scope.$broadcast('scroll.infiniteScrollComplete');
                  });
              };

              $http.post(host + '/Timetable/GetByCourse', { BatchId: BatchId, CourseId: CourseId, OrgId: OrgId }).success(function (data) {
                  debugger;
                  if (!data.WeekdayTimeTables) {

                  }
                  else {
                      $scope.periodData = data;
                      $scope.periodData.WeekdayTimeTables.forEach(function (value, index) {
                          value.Periods.forEach(function (value2, index2) {
                              console.log(value2.StartTime);
                              console.log(value2.EndTime);
                              value2.StartTime = new Date(value2.StartTime);
                              value2.EndTime = new Date(value2.EndTime);
                          });
                          console.log(index, value);
                      });
                  }
              });
          }])
            .controller("examinationDetailsCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
                var BatchId = localStorage['selectedStudentBatch'];
                var CourseId = localStorage['selectedStudentCourse'];
                var OrgId = localStorage['selectedStudentOrgId'];
                $http.post(host + '/Exam/GetByCourse', { BatchId: BatchId, CourseId: CourseId, OrgId: OrgId }).success(function (data) {
                    $scope.examinationDetail = data;
                    //$scope.examinationDetail.ExamSchedule.forEach(function (value, index) {
                    //    console.log(value.ExamDate);
                    //    console.log(value.Starttime);
                    //    console.log(value.Duration);
                    //    value.ExamDate = new Date(value.ExamDate);
                    //    value.Starttime = new Date(value.Starttime);
                    //    value.Duration = new Date(value.Duration);
                    //    console.log(value, index);
                    //})
                });
            }])
           .controller("TeacherDetailsCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
               var studentId = localStorage['selectedStudent'];
               $http.post(host + '/Faculty/GetFaculty', { StudentId: studentId }).success(function (data) {
                   debugger;
                   $scope.TeacherDetail = data;
               });
           }])
              .controller("assesmentReportCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
                  var studentId = localStorage['selectedStudent'];
                  $scope.assesmentDetails = {};
                  var OrgId = localStorage['selectedStudentOrgId'];
                  $http.post(host + '/AssesmentReport/GetByStudent', { StudentId: studentId, OrgId: OrgId }).success(function (data) {
                      debugger;
                      $scope.assesmentReportDetail = data;
                      data.Reports.forEach(function (e) {
                          if (!$scope.assesmentDetails[e.Examtype]) {
                              $scope.assesmentDetails[e.Examtype] = [];
                          }
                          $scope.assesmentDetails[e.Examtype].push({ 'Marks': e.Marks, 'SubjectName': e.SubjectName });
                      });
                  })
              }])
           .controller("EmployeeProfileCtrl", ["$scope", "$state", "$http", "$CustomLS", "$ionicLoading", function ($scope, $state, $http, $CustomLS, $ionicLoading) {
               $scope.user = $CustomLS.getObject('LoginUser');
               var EmpId = $scope.user.UserId;
               $scope.imageUrl = host + "PersonalDetail/getEmployeeImage?Id=" + EmpId;
               $ionicLoading.show({ template: 'Loading Personal Details..', duration: 10000 });
               $http.post(host + '/PersonalDetail/GetEmployeeDetail', { 'EmployeeId': $scope.user.UserId, 'OrgId': $scope.user.OrgId }).success(function (data) {
                   $scope.Details = data;
                   $ionicLoading.hide();
               })
           }])
        .controller("EmployeeGalleryCtrl", ["$scope", "$state", "$filter", "$http", "$ionicPopup", "ionicDatePicker", "$ionicHistory", "$ionicLoading", "$CustomLS", function ($scope, $state, $filter, $http, $ionicPopup, ionicDatePicker, $ionicLoading, $ionicHistory, $CustomLS) {
            $scope.selected = {}
            $scope.user = $CustomLS.getObject('LoginUser');
            debugger;
            $http.post(host + '/Attandance/getBatchAndCourse', { OrgId: $scope.user.OrgId }).success(function (data) {
                debugger;
                $scope.Batchlist = data.Batches;
                $scope.CourseList = data.Courses;
            });
            $scope.Image = {
                Photo: []
            }

            $scope.uploadFile = function (input) {
                debugger;
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        //Sets the Old Image to new New Image
                        $('#photo-id').attr('src', e.target.result);

                        //Create a canvas and draw image on Client Side to get the byte[] equivalent
                        var canvas = document.createElement("canvas");
                        var imageElement = document.createElement("img");
                        imageElement.setAttribute('src', e.target.result);
                        var dd = imageElement.outerHTML;
                        $scope.vat = dd;
                        canvas.width = imageElement.width;
                        canvas.height = imageElement.height;
                        var context = canvas.getContext("2d");
                        context.drawImage(imageElement, 0, 0);
                        var base64Image = canvas.toDataURL("image/jpeg");

                        //Removes the Data Type Prefix
                        //And set the view model to the new value
                        $scope.Image.Photo = base64Image.replace(/data:image\/jpeg;base64,/g, '');
                    }
                    //Renders Image on Page
                    reader.readAsDataURL(input.files[0]);
                }
            };
            $scope.UploadGalleryImages = function (data) {
                debugger;
                var a = $scope.Image;
            }
        }])


         .controller("EmployeeHolidaysCtrl", ["$scope", "$state", "$http", "$CustomLS", '$ionicLoading', function ($scope, $state, $http, $CustomLS, $ionicLoading) {
             $scope.user = $CustomLS.getObject('LoginUser');
             $ionicLoading.show({ template: "Loading holidays..." });
             $http.post(host + '/Holiday/GetEmployeeHolidays', { 'OrgId': $scope.user.OrgId }).success(function (data) {
                 $scope.EmployeeHoliday = data;
                 $ionicLoading.hide();
             });
         }])

        .controller("EmployeeSettingsCtrl", ["$scope", "$state", "$http", "$CustomLS", function ($scope, $state, $http, $CustomLS) {
            $scope.Employeelogout = function () {
                localStorage.clear();
                $state.go('login');
            };
        }])
                .controller("profileCtrl", ["$scope", "$state", function ($scope, $state, $http) {

                }])
                .controller("signoutCtrl", ["$scope", "$state", function ($scope, $state, $http) {

                }])

                .controller("GeolocationCtrl", ["$scope", "$state", "$http", "$cordovaGeolocation", "$interval", "$CustomLS", function ($scope, $state, $http, $cordovaGeolocation, $interval, $CustomLS) {
                    $scope.Button = {
                        Text: "Start Location Update",
                        LocationUpdate: localStorage['locationUpdate'] == "true"
                    }

                    //$scope.Button.LocationUpdate = $scope.Button.IsLocationUpading == "true";
                    debugger;
                    $scope.Routes = [];
                    $scope.data = {};
                    debugger;
                    $scope.user = $CustomLS.getObject('LoginUser');
                    $http.post(host + '/GeoLocation/GetRouteCode', { 'OrgId': $scope.user.OrgId }).success(function (data) {
                        debugger;
                        $scope.RouteCode = data;
                    });

                    $scope.StartUpdateLocation = function () {
                        debugger;
                        var callbackFn = function (location) {
                            $http.get(host + 'GeoLocation/UpdateRouteLocation?RouteCode=' + $scope.data.code + '&OrgId=' + $scope.user.OrgId + '&Lattitude=' + location.latitude + '&Longitude=' + location.longitude)
                                .success(function (data) {
                                    alert('location updated');
                                }).error(function () {
                                    alert('error updating location');
                                });

                            //alert('Location:' + location.latitude + ',' + location.longitude);
                            backgroundGeolocation.finish();
                        };

                        var failureFn = function (error) {
                            alert('BackgroundGeolocation error');
                        };

                        backgroundGeolocation.configure(callbackFn, failureFn, {
                            desiredAccuracy: 100,
                            stationaryRadius: 20,
                            distanceFilter: 30,
                            interval: 5000,
                            //debug: true,
                            //startOnBoot: true,
                            //stopOnTerminate: false
                        }, function (state) {
                            debugger;
                        });
                        if ($scope.Button.LocationUpdate == true) {
                            localStorage["locationUpdate"] = "true";
                            alert(JSON.stringify(backgroundGeolocation));
                            backgroundGeolocation.start();
                            var timeoutDate = new Date();
                            timeoutDate.setMinutes(0);
                            timeoutDate.setHours(22);
                            setTimeout(function () {
                                backgroundGeolocation.stop();
                            }, (timeoutDate - new Date()))
                        }
                        else {
                            localStorage["locationUpdate"] = "false";
                            alert(JSON.stringify(backgroundGeolocation));
                            backgroundGeolocation.stop();
                        }
                    };

                    $scope.Route = $scope.data.code;
                }])
            .controller("AttendanceCtrl", ["$scope", "$state", "$http", "$cordovaBarcodeScanner", "$CustomLS", "$ionicPopup", function ($scope, $state, $http, $cordovaBarcodeScanner, $CustomLS, $ionicPopup) {
                $scope.user = $CustomLS.getObject('LoginUser');
                $scope.studentsList = [];
                $http.post(host + '/Attandance/getStudentsList', { 'OrgId': $scope.user.OrgId }).then(function (res) {
                    console.log(res);
                    $scope.studentsList = res.data.AdmStudents;
                })
                $scope.scannedStudents = {
                    Id: [],
                    Name: [],
                    StudentId: []
                }
                $scope.data = {
                }

                $scope.DeleteCurrentRow = function (index) {

                    $scope.scannedStudents.Name.splice(index, 1);
                    $scope.scannedStudents.Id.splice(index, 1);
                }
                $scope.scanBarCode = function () {
                    $cordovaBarcodeScanner.scan().then(function (imageData) {
                        var Id = imageData.text;
                        $scope.studentsList.forEach(function (value, index) {
                            if (value.StudentId == Id) {
                                $scope.scannedStudents.Name.push(value.Name)
                                $scope.scannedStudents.Id.push(value.Id)
                                $scope.scannedStudents.StudentId.push(value.StudentId)
                            }
                        })
                        localStorage.setItem(JSON.stringify($scope.scannedStudents.Name), JSON.stringify($scope.scannedStudents.Id));

                    }, function (error) {
                        console.log("An error happened -> " + error);
                    });
                }
                $scope.sendStudentsTimings = function () {
                    var pick = $scope.data.choice;
                    var jsonObj1 = $scope.scannedStudents.Id;
                    var jasonobj4 = localStorage.getItem(JSON.stringify($scope.scannedStudents.Name)).replace(']', '').replace('[', '');
                    $scope.date = new Date();
                    var jsonObj2 = JSON.stringify($scope.date);
                    $http.post(host + '/Attandance/SaveAttendance?OrgId=' + $scope.user.OrgId + '&StudentId=' + jasonobj4 + '&scanDateTime=' + jsonObj2 + '&IsCheckIn=' + pick).success(function (data) {
                        debugger;
                        if (data.status) {

                            var alertPopup = $ionicPopup.alert({
                                title: 'Success',
                                template: 'Saved Successfully!'
                            });
                            $state.go('Attendance');
                            $scope.scannedStudents = {};
                        }
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Failed',
                                template: 'Error Occured!'
                            });
                        }
                    });
                }
            }])

        .controller("TransportCtrl", ["$scope", "$state", "$http", "$cordovaBarcodeScanner", "$CustomLS", "$ionicPopup", function ($scope, $state, $http, $cordovaBarcodeScanner, $CustomLS, $ionicPopup) {
            $scope.user = $CustomLS.getObject('LoginUser');
            $scope.RouteCode = [];
            $scope.selected = {};
            $scope.studentsList = [];
            $http.post(host + '/Attandance/getStudentsList', { 'OrgId': $scope.user.OrgId }).then(function (res) {
                console.log(res);
                $scope.studentsList = res.data.AdmStudents;
            })
            $http.post(host + '/GeoLocation/GetRouteCode', { 'OrgId': $scope.user.OrgId }).success(function (data) {
                $scope.RouteCode = data;
            })
            $scope.scannedStudents = {
                Id: [],
                Name: [],
                StudentId: []
            }
            $scope.data = {
            }

            $scope.DeleteCurrentRow = function (index) {

                $scope.scannedStudents.Name.splice(index, 1);
                $scope.scannedStudents.Id.splice(index, 1);
            }
            $scope.scanBarCode = function () {
                $cordovaBarcodeScanner.scan().then(function (imageData) {
                    var Id = imageData.text;
                    $scope.studentsList.forEach(function (value, index) {
                        if (value.StudentId == Id) {
                            $scope.scannedStudents.Name.push(value.Name)
                            $scope.scannedStudents.Id.push(value.Id)
                            $scope.scannedStudents.StudentId.push(value.StudentId)
                        }
                    })
                    localStorage.setItem(JSON.stringify($scope.scannedStudents.Name), JSON.stringify($scope.scannedStudents.Id));

                }, function (error) {
                    console.log("An error happened -> " + error);
                });
            }
            $scope.sendStudentsTimings = function () {
                debugger;
                //if (!$scope.selected.Route) {
                //    alert("Please select the Route Code!");
                //    return;
                //}
                var pick = $scope.data.choice;
                var Position = $scope.data.postion;
                var jsonObj1 = $scope.scannedStudents.Id;
                var jasonobj4 = localStorage.getItem(JSON.stringify($scope.scannedStudents.Name)).replace(']', '').replace('[', '');
                $scope.date = new Date();

                var jsonObj2 = JSON.stringify($scope.date);
                $http.post(host + '/Attandance/SaveTransport?OrgId=' + $scope.user.OrgId + '&StudentId=' + jasonobj4 + '&scanDateTime=' + jsonObj2 + '&IsPickUp=' + pick + '&Position=' + Position).success(function (data) {
                    debugger;
                    if (data.status) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Success',
                            template: 'Saved Successfully!'
                        });
                        $state.go('barCodeScanner');
                        $scope.scannedStudents = {};
                    }
                    else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Failed',
                            template: 'Error Occured!'
                        });
                    }
                });



                //var callbackFn = function (location) {
                //    $http.get(host + 'GeoLocation/UpdateRouteLocation?RouteCode=' + $scope.selected.Route + '&OrgId=' + $scope.user.OrgId + '&Lattitude=' + location.latitude + '&Longitude=' + location.longitude)
                //        .success(function (data) {
                //            alert('location updated');
                //        }).error(function () {
                //            alert('error updating location');
                //        });

                //    //alert('Location:' + location.latitude + ',' + location.longitude);
                //    backgroundGeolocation.finish();
                //};

                //var failureFn = function (error) {
                //    alert('BackgroundGeolocation error');
                //};

                //backgroundGeolocation.configure(callbackFn, failureFn, {
                //    desiredAccuracy: 100,
                //    stationaryRadius: 20,
                //    distanceFilter: 30,
                //    interval: 5000,
                //    //debug: true,
                //    //startOnBoot: true,
                //    //stopOnTerminate: false
                //});

                //if (pick) {
                //    backgroundGeolocation.start();
                //}
                //else {
                //    backgroundGeolocation.stop();
                //}
            }

        }])
                            //errorCtrl managed the display of error messages bubbled up from other controllers, directives, myappService
    .controller("errorCtrl", ["$scope", "myappService", function ($scope, myappService) {
        //public properties that define the error message and if an error is present
        $scope.error = "";
        $scope.activeError = false;

        //function to dismiss an active error
        $scope.dismissError = function () {
            $scope.activeError = false;
        };

        //broadcast event to catch an error and display it in the error section
        $scope.$on("error", function (evt, val) {
            //set the error message and mark activeError to true
            $scope.error = val;
            $scope.activeError = true;

            //stop any waiting indicators (including scroll refreshes)
            myappService.wait(false);
            $scope.$broadcast("scroll.refreshComplete");

            //manually apply given the way this might bubble up async
            $scope.$apply();
        });
    }]);
})
();