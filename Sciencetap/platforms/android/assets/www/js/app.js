var app = angular.module('ionicApp', ['ionic', 'ngCordova'])

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
	//disable caching
	//$ionicConfigProvider.views.maxCache(0);
	$stateProvider
		.state('login',{
			url: '/login',
			templateUrl: 'templates/login.html',
			controller: 'LoginCtrl'
		})
		.state('home',{
			url: '/home',
			templateUrl: 'templates/home.html',
			controller: 'HomeCtrl'
		})
		.state('map',{
			url: '/map',
			templateUrl: 'templates/map.html',
			controller: 'MapCtrl',
			cache: false
		})
		.state('collect',{
			url: '/collect',
			templateUrl: 'templates/collect.html',
			controller: 'CollectCtrl'
		})
		.state('view',{
			url: '/view',
			templateUrl: 'templates/view.html',
			controller: 'ViewCtrl'
		})
		.state('create_user',{
			url: '/create_user',
			templateUrl: 'templates/create_user.html',
			controller: 'LoginCtrl'
		})
		.state('reset_password',{
			url: '/reset_password',
			templateUrl: 'templates/reset_password.html',
			controller: 'LoginCtrl'
		})
		.state('admin',{
			url: '/admin',
			templateUrl: 'templates/admin.html',
			controller: 'AdminCtrl'
		})
	$urlRouterProvider.otherwise('/login')
	
	window.localStorage.setItem("admin", "false");
	console.log("Platform");
	console.log(ionic.Platform.platform());
	console.log("Device");
	console.log(ionic.Platform.device());
	console.log("IPad");
	console.log(ionic.Platform.isIPad());
	console.log("IOS");
	console.log(ionic.Platform.isIOS());
	console.log("android");
	console.log(ionic.Platform.isAndroid());
	console.log("windows");
	console.log(ionic.Platform.isWindowsPhone());
	
	if(ionic.Platform.isWindowsPhone() || ionic.Platform.isAndroid() || ionic.Platform.isIOS()){
		setTimeout(function(){
			navigator.splashscreen.hide();
		}, 1000);
		console.log("Is cordova, admin false");
		console.log(window.localStorage.getItem("admin"));
	}else{
		console.log("Is browser, admin true");
		window.localStorage.setItem("admin", "true");
		console.log(window.localStorage.getItem("admin"));
	}
	
})

app.run(function($ionicPlatform, $state) {

	$ionicPlatform.ready(function() {
		if(window.cordova && window.cordova.plugins.Keyboard) {
		     cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if(window.StatusBar) {
		     StatusBar.styleDefault();
		}
		var loggedInUser = window.localStorage.getItem('loggedInUser');
		if(loggedInUser != null){
			$state.go('home');	
		}
	});
})

app.controller('AdminCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $compile, $ionicModal, $ionicHistory, $http, $ionicScrollDelegate){
	console.log("In AdminCtrl");
});

app.controller('LoginCtrl', function($scope, $ionicPopup, $state, $ionicLoading, $compile, $ionicModal, $ionicHistory, $http, LoginService, $ionicScrollDelegate){
	$scope.data = {};
	$scope.newUserFirstName = '';
	$scope.newUserLastName = '';
	$scope.newUserEmail = '';
	$scope.newUserPhone = '';
	$scope.resetEmail = '';
	$scope.loginDisabled = false;

	$scope.showSpinner = function(){
		$ionicLoading.show({
			template: '<ion-spinner icon="spiral"></ion-spinner>'
		});
	};

	$scope.hideSpinner = function(){ $ionicLoading.hide(); };
	$scope.scrollTop = function(){ $ionicScrollDelegate.scrollTop(); };
	$scope.createUser = function(){ $state.go('create_user'); }
	$scope.openResetPassword = function(){ $state.go('reset_password'); }

	$scope.login = function(){
		LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data){
			$scope.showSpinner();
			$scope.loginDisabled = true;
			var request = $http({
			    method: "post",
			    url: 'http://sciencetap.us/ionic/login.php',
			    data:{
				emailLogin: $scope.data.username,
				passLogin: $scope.data.password
			    }
			});
			request.success(function(data){
				if (data.Status == 'Success'){
					window.localStorage.setItem("userId", data.userId);
					window.localStorage.setItem("firstName", data.firstName);
					window.localStorage.setItem("lastName", data.lastName);
					window.localStorage.setItem("email", data.email);
					window.localStorage.setItem("phone", data.phone);
					if(data.superAdmin === undefined){
						if(data.projectAdmin === undefined){
							window.localStorage.setItem("role", 'projectUser');
						}else{
							window.localStorage.setItem("role", 'projectAdmin');
						}	
					}else{
						window.localStorage.setItem("role", 'superAdmin');
					}
					if(data.Message === undefined){
						window.localStorage.setItem("message", '');
					}else{
						window.localStorage.setItem("message", data.Message);
					}
					window.localStorage.setItem('loggedInUser', true);
					$scope.hideSpinner();
					$scope.loginDisabled = false;
					$scope.data.password = '';
					$state.go('home');
				}else{
					$scope.data.password = '';
					$scope.hideSpinner();
					var alertPopup = $ionicPopup.alert({
					    title: 'Login failed',
					    template: 'Please check your credentials'
					});
					$scope.loginDisabled = false;
				}
			});
			request.error(function(){
				$scope.data.password = '';
				$scope.hideSpinner();
				$scope.loginDisabled = false;
			});
		}).error(function(){
			$scope.data.password = '';
			$scope.hideSpinner();
			var alertPopup = $ionicPopup.alert({
			    title: 'Login failed',
			    template: 'Please check your credentials'
			});
			$scope.loginDisabled = false;
		});
	}

	var mainPopup = function(title, message){
		var popup = $ionicPopup.alert({
			title: title,
			template: message
		});
		popup.then(function(res){
			console.log("main popup closed");
		});
	};

	$scope.resetPassword = function(){
		$scope.showSpinner();
		console.log($scope.resetEmail);
		if($scope.resetEmail == ""){
			$scope.hideSpinner();
			mainPopup('A required field was not entered','');
			return;
		}
		var uploadData = {
			email : $scope.resetEmail
		};
		var request = $http({
		    method: "post",
		    url: 'http://sciencetap.us/ionic/resetPassword.php',
		    data:{
			uploadData: uploadData 
		    }
		});
		request.success(function(data){
			console.log(data);
			if(data.Status == 'Success'){
				setTimeout(function(){
					$scope.hideSpinner();
					mainPopup('Data Submitted Successfully','An email has been sent with the new password');
				}, 1000);
				$state.go('login');
			}else{
				setTimeout(function(){
					$scope.hideSpinner();
					mainPopup('Data Not Submitted Successfully', 'No Sciencetap account has been created with that email address');
				}, 1000);
				$state.go('login');
			}
		});
		request.error(function(data){
			console.log(data);
			setTimeout(function(){
				$scope.hideSpinner();
				mainPopup('Data Not Submitted Successfully', 'No Sciencetap account has been created with that email address');
			}, 1000);
			$state.go('login');
		});
	}
	$scope.submitNewUser = function(){
		$scope.showSpinner();
		console.log($scope.newUserFirstName);
		console.log($scope.newUserLastName);
		console.log($scope.newUserEmail);
		if($scope.newUserFirstName == "" || $scope.newUserLastName == "" || $scope.newUserEmail == ""){
			$scope.hideSpinner();
			mainPopup('A required field was not entered','');
			return;
		}
		var uploadData = {
			first_name : $scope.newUserFirstName,
			last_name : $scope.newUserLastName,
			email : $scope.newUserEmail,
			phone : $scope.newUserPhone
		};
		var request = $http({
		    method: "post",
		    url: 'http://sciencetap.us/ionic/createNewUser.php',
		    data:{
			uploadData: uploadData 
		    }
		});
		request.success(function(data){
			console.log(data);
			setTimeout(function(){
				$scope.hideSpinner();
				mainPopup('Data Submitted Successfully','A request has been put in to create the account.  You will be notified via email when the account is created');
			}, 1000);
			$state.go('login');
		});
		request.error(function(data){
			console.log(data);
			setTimeout(function(){
				$scope.hideSpinner();
				mainPopup('Data Not Submitted Successfully', 'The request could not be processed at this time');
			}, 1000);
			$state.go('login');
		});
	}
});

app.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, GoogleMaps){
	GoogleMaps.init('AIzaSyAWStknXNZGYHFiPNEHPEETgBkAnuN7_kc');

});	

app.controller('CollectCtrl', function($scope, $ionicPopup, $state, $cordovaGeolocation, $ionicLoading, $compile, $ionicModal, $ionicHistory, $http, $ionicSlideBoxDelegate, Camera, $ionicLoading, $ionicScrollDelegate){
	$scope.projects = [];
	$scope.sites = [];
	$scope.images = [];
	$scope.showImagesItem = $scope.images.length;
	$scope.fileURI;
	$scope.forms = [];
	$scope.formSelected = false;
	$scope.projectSelected = false;
	$scope.user = {};
	$scope.user.id = window.localStorage.getItem("userId");
	$scope.observationID = 0;
	$scope.form_inputs = [];
	$scope.dropdowns = [];
	$scope.imageName;
	$scope.submitLat;
	$scope.submitLng;

	var noProject = { name: 'Select a Project', id: 0 };
	var noSite = { site_name: 'Select a Site', site_id: 0 };
	var noForm = { name:  'Select a Form (Optional)', id: '0', fields: [] };
	var noDropdown = { dropdown_value: 'none', form_input_id: '0' }
	$scope.isAdmin = window.localStorage.getItem("admin");
	console.log("isAdmin");
	console.log($scope.isAdmin);

        $scope.selectedProject = noProject; 
        $scope.selectedSite = noSite; 
        $scope.selectedForm = noForm; 
        $scope.selectedDropdown = noDropdown; 

        $scope.selectProject = function(project){ $scope.selectedProject = project;$scope.projectSelected = true; $scope.selectedForm = noForm; }
        $scope.selectSite = function(site){ $scope.selectedSite = site; }
        $scope.selectForm = function(form){ $scope.selectedForm = form; $scope.formSelected = true; }
        $scope.selectDropdown= function(dropdown){ $scope.selectedDropdown = dropdown; }

	$ionicModal.fromTemplateUrl('templates/collect_project.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.projectModal = modal;
	});
	$scope.openProjectModal = function() { $scope.projectModal.show(); };
	$scope.closeProjectModal = function() { $scope.projectModal.hide(); };

	$ionicModal.fromTemplateUrl('templates/collect_site.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.sitesModal = modal;
	});
	$scope.openSitesModal = function() { $scope.sitesModal.show(); };
	$scope.closeSitesModal = function() { $scope.sitesModal.hide(); };

	$ionicModal.fromTemplateUrl('templates/picture_slide.html', {
	       scope: $scope,
	       animation: 'slide-in-up'
	   }).then(function(modal) {
		   $scope.pictureModal = modal;
	   });
	$scope.openPictureModal = function() { $scope.pictureModal.show(); };
	$scope.closePictureModal = function() { $scope.pictureModal.hide(); };

	$ionicModal.fromTemplateUrl('templates/collect_form.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.formsModal = modal;
	});
	$scope.openFormsModal = function() { $scope.formsModal.show(); };
	$scope.closeFormsModal = function() { $scope.formsModal.hide(); };

	$ionicModal.fromTemplateUrl('templates/collect_dropdown.html', {
		scope: $scope,
		animation: 'slide-in-up',
		dropdowns: $scope.dropdowns 
	}).then(function(modal) {
		$scope.dropdownModal = modal;
	});
	$scope.openDropdownModal = function() { $scope.dropdownModal.show(); };
	$scope.closeDropdownModal = function() { $scope.dropdownModal.hide(); };

	$ionicModal.fromTemplateUrl('templates/collect_imageName.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.imageNameModal = modal;
	});
               
	$scope.openImageNameModal = function() { $scope.imageNameModal.show(); };
	$scope.closeImageNameModal = function(image) {
		$scope.imageName = image.name;
		$scope.images.push({
			"fileURI" : $scope.fileURI,
			"imageName" : $scope.imageName
		});
		console.log("Name Image Modal closed");
		console.log($scope.images);
		$scope.showImagesItem = $scope.images.length;
		$scope.imageName = '';
		$scope.fileURI = '';
		$scope.imageNameModal.hide();
	};
               
               //Cleanup the modal when we're done with it!
               $scope.$on('$destroy', function() {
                          $scope.sitesModal.remove();
                          $scope.projectModal.remove();
                          $scope.pictureModal.remove();
                          $scope.formsModal.remove();
                          $scope.imageNameModal.remove();
                          $scope.dropdownModal.remove();
                });
               
	$scope.$on('modal.hidden', function() { });
	$scope.$on('modal.removed', function() { });

	$scope.submitData = function(){
		var options = {timeout: 10000, enableHighAccuracy: true};
		$scope.showSpinner();
		$cordovaGeolocation.getCurrentPosition(options).then(function(position){
			console.log("Submit Data geolocation latitude");
			console.log(position.coords.latitude);
			console.log("Submit Data geolocation longitude");
			console.log(position.coords.longitude);
			$scope.submitLat = position.coords.latitude;
			$scope.submitLng = position.coords.longitude;
			if($scope.selectedProject.id == "0"){
				$scope.hideSpinner();
				collectPopup('No Project Selected','A project must be selected');
				return;
			}
			if($scope.selectedForm.id != '0'){
				console.log("Submitting Form Data");
				console.log($scope.selectedForm);
				console.log("Submit - Form Id");
				console.log($scope.selectedForm.id);
				console.log("Submit - Form Fields and Inputs");
				for(i = 0; i < $scope.selectedForm.fields.length; i++){
					console.log("Field Input Name");
					console.log($scope.selectedForm.fields[i].name);
					console.log("Field Input Type");
					console.log($scope.selectedForm.fields[i].form_input_type);
					console.log("Field Input Value");
					console.log($scope.selectedForm.fields[i].input);
					if($scope.selectedForm.fields[i].form_input_type == 'Dropdown'){
						if(!$scope.selectedForm.fields[i].selected){
							$scope.hideSpinner();
							collectPopup('A required field was not entered', $scope.selectedForm.fields[i].name);
						return;
						}
					}
					if($scope.selectedForm.fields[i].input == null){
						$scope.hideSpinner();
						collectPopup('A required field was not entered', $scope.selectedForm.fields[i].name);
						return;
					}
				}
				var uploadData = {
				project_id: $scope.selectedProject.id,
				site_id: $scope.selectedSite.site_id,
				user_id: $scope.user.id,
				form: $scope.selectedForm,
				lat : $scope.submitLat,
				lng : $scope.submitLng
				};
				var request = $http({
				    method: "post",
				    url: 'http://sciencetap.us/ionic/uploadData.php',
				    data:{ uploadData: uploadData }
				});
				request.success(function(data){
					$scope.observationID = data.slice(1, -1);
					if($scope.images.length > 0){
						collectPopup('Data submitted successfully','');
						$scope.send();
					}else{
						setTimeout(function(){
							$scope.refresh(); $scope.hideSpinner();
							collectPopup('Data submitted successfully','');
						}, 1000);
					}
				});
			}else if($scope.images.length > 0){
				var uploadData = {
					project_id: $scope.selectedProject.id,
					site_id: $scope.selectedSite.site_id,
					user_id: $scope.user.id,
					lat : $scope.submitLat,
					lng : $scope.submitLng
				};
				var request = $http({
				    method: "post",
				    url: 'http://sciencetap.us/ionic/imageObservation.php',
				    data:{
					uploadData: uploadData 
				    }
				});
				request.success(function(data){
					$scope.observationID = data.slice(1, -1);
					$scope.send();
				});
			}else{
				setTimeout(function(){
					$scope.hideSpinner(); $scope.refresh();
					collectPopup('No data to submit','');
				}, 1000);
			}
		}, function(error){
			$scope.hideSpinner();
			console.log("Could not get location");
		});
	}
	$scope.send = function(){
		for(var i = 0; i < $scope.images.length; i++){
			var myImg = $scope.images[i].fileURI;
			var options = new FileUploadOptions();
			options.fileKey = "post";
			options.mimeType = "image/jpeg";
			options.chunkedMode = false;
			var params = {};
			params.imageName = $scope.images[i].imageName;
			params.project_id = $scope.selectedProject.id;
			params.site_id = $scope.selectedSite.site_id;
			params.user_id = $scope.user.id;
			params.observation_id = $scope.observationID;
			options.params = params;
			var ft = new FileTransfer();
			if(i == $scope.images.length -1){
				ft.upload(myImg, encodeURI('http://sciencetap.us/ionic/uploadImages.php'), onFinalUploadSuccess, onUploadFail, options);
			}else{
				ft.upload(myImg, encodeURI('http://sciencetap.us/ionic/uploadImages.php'), onUploadSuccess, onUploadFail, options);
			}
		}
	}
	var onFinalUploadSuccess = function(r){
		console.log("Code =" + r.responseCode);
		console.log("Response = " + r.response);
		console.log("Sent = " + r.bytesSent);
		setTimeout(function(){
			$scope.hideSpinner();
			collectPopup('Image(s) uploaded successfully','');
			$scope.refresh();
		}, 1000);
	}
	var onUploadSuccess = function(r){
		console.log("Code =" + r.responseCode);
		console.log("Response = " + r.response);
		console.log("Sent = " + r.bytesSent);
	}
	var onUploadFail = function(error){
		console.log("upload error source " + error.source);
		console.log("upload error target " + error.target);
		setTimeout(function(){
			$scope.hideSpinner();
			collectPopup('Data Not Submitted Successfully', 'The data upload could not be processed at this time.');
			$scope.scrollTop();
		}, 1000);
	}
	$scope.showSpinner = function(){
		$ionicLoading.show({
			template: '<ion-spinner icon="spiral"></ion-spinner>'
		});
	};
	$scope.hideSpinner = function(){ $ionicLoading.hide(); };
	var collectPopup = function(title, message){
		var popup = $ionicPopup.alert({ title: title, template: message });
		popup.then(function(res){ console.log("main popup closed"); });
	};
	$scope.scrollTop = function(){ $ionicScrollDelegate.scrollTop(); };
	$scope.refresh = function(){
		$scope.selectedProject = noProject; 
		$scope.selectedSite = noSite; 
		$scope.selectedForm = noForm; 
		$scope.images = [];
		$scope.showImagesItem = $scope.images.length;
		clearFormInputs();
		$scope.scrollTop();
	};
	var clearFormInputs = function(){
		for(i = 0; i < $scope.forms.length; i++){
			for(j = 0; j < $scope.forms[i].fields.length; j++){
				$scope.forms[i].fields[j].input = '';
			}
		}
	}
	$scope.getDropdown = function(id){
		$scope.selectedDropdown = []; 
		for(i = 0; i < $scope.dropdowns.length; i++){
			if($scope.dropdowns[i].form_input_id == id){
				$scope.selectedDropdown.push($scope.dropdowns[i]);
			}
		}
	}
	$scope.dropdownInput = function(value, id){
		for(i = 0; i < $scope.selectedForm.fields.length; i++){
			if($scope.selectedForm.fields[i].fieldID == id){
				$scope.selectedForm.fields[i].input = value;
				$scope.selectedForm.fields[i].selected = true;
			}
		}
	}

	$scope.getPhoto = function() {
		var options = {
			quality: 50,
			destinationType: navigator.camera.DestinationType.FILE_URI,
			sourceType: 1,
			encodingType: 0
		}
		Camera.getPicture(options).then(function(FILE_URI){
			console.log(FILE_URI);
			$scope.fileURI = FILE_URI;
		       $scope.openImageNameModal();
		}, function(err){
			console.log("failed" + err);
		});
	}
    $scope.removeImage = function(){
        $scope.images.splice($ionicSlideBoxDelegate.currentIndex(),1);
        $ionicSlideBoxDelegate.update();
        $ionicSlideBoxDelegate.slide(0);
	$scope.showImagesItem = $scope.images.length;
    }
        $scope.addData = function(num, text){
            $scope.selectedForm.fields.push(
                {
                            name: text,
                            fieldID: num,
                            formID: '-1'
                }
            );
        };

	$scope.goBack = function(){ $ionicHistory.goBack(); }

	var request = $http({
	    method: "post",
	    url: 'http://sciencetap.us/ionic/getCollectData.php',
	    data:{
		userId: $scope.user.id
	    }
	});
	request.success(function(data){
		if (data.Status == 'Success'){
			$scope.projects = [];
			$scope.sites = [];
			$scope.forms = [];
			$scope.form_inputs = [];
			$scope.dropdowns = [];
			console.log("Get Collect Data - Forms");
			console.log(data.forms);
			for(var i = 0; i < data.projects.length; i++){
				$scope.projects.push(
				{
				    name: data.projects[i].name,
				    id: data.projects[i].id
				}
				);
			}
			for(var i = 0; i < data.sites.length; i++){
				$scope.sites.push(
				{
				    site_name: data.sites[i].site_name,
				    site_id: data.sites[i].site_id,
				    project_id: data.sites[i].project_id
				}
				);
			}
			for(var i = 0; i < data.forms.length; i++){
				$scope.forms.push(
				{
					name:  data.forms[i].form_name,
					id: data.forms[i].form_id,
					description: data.forms[i].form_description,
					project_id: data.forms[i].project_id,
					fields: []
				}
				);
			}
			for(i = 0; i < data.form_inputs.length; i++){
				if(data.form_inputs[i].form_input_type =="Dropdown"){
					$scope.form_inputs.push(
					{
						name: data.form_inputs[i].form_input_name,
						fieldID: data.form_inputs[i].form_input_id,
						formID: data.form_inputs[i].form_id,
						input: '',
						form_input_type: data.form_inputs[i].form_input_type,
						selected : false
					}
					);

				}else{
					$scope.form_inputs.push(
					{
						name: data.form_inputs[i].form_input_name,
						fieldID: data.form_inputs[i].form_input_id,
						formID: data.form_inputs[i].form_id,
						input: '',
						form_input_type: data.form_inputs[i].form_input_type
					}
					);
				}
			}
			console.log(data.form_inputs);
			for(i = 0; i < $scope.form_inputs.length; i++){
			    for(var j = 0; j < $scope.forms.length; j++){
				if($scope.forms[j].id == $scope.form_inputs[i].formID){
				    $scope.forms[j].fields.push($scope.form_inputs[i]);
				}
			    }
			}
			for(i = 0; i < data.dropdowns.length; i++){
				$scope.dropdowns.push(
				{
				    dropdown_value: data.dropdowns[i].dropdown_value,
				    form_input_id: data.dropdowns[i].form_input_id
				}
				);
			}
		}
	});
	request.error(function(data){
		console.log(data);
		console.log("Collect error");
	});
});

app.controller('ViewCtrl', function($scope, $ionicPopup, $state, $cordovaGeolocation, $ionicLoading, $compile, $ionicModal, $ionicHistory, $http, $ionicSlideBoxDelegate, $ionicLoading, $ionicScrollDelegate){
	$scope.user = {};
	$scope.user.id = window.localStorage.getItem("userId");
	$scope.projects = [];
	$scope.sites = [];
	$scope.forms = [];
	$scope.form_inputs= [];
	$scope.observations = [];
	$scope.observationData = [];
	$scope.observationObjects = [];
	$scope.data = [];
	$scope.images = [];
	var reset = function(){
		$scope.projects = [];
		$scope.sites = [];
		$scope.forms = [];
		$scope.form_inputs= [];
		$scope.observations = [];
		$scope.observationData = [];
		$scope.observationObjects = [];
		$scope.data = [];
		$scope.images = [];
	}
	$scope.projectSelected = false;
	var noProject = { name: 'None', id: 0 };
	$scope.selectedProject = noProject;
	$scope.observationObjects.push({
		projectName : 'None',
		siteName : 'None',
		formName : 'None',
		time : 'None' 
	});
	$scope.observationObjects[0].images = [];
	$scope.customFilters = [
		{"name" : "My Uploads", "id" : "1"}, {"name" : "My Projects", "id" : "2"}
	];
	$scope.isAdmin = window.localStorage.getItem("admin");
	
	$scope.showSpinner = function(){
		$ionicLoading.show({
			template: '<ion-spinner icon="spiral"></ion-spinner>'
		});
	};
	$scope.hideSpinner = function(){ $ionicLoading.hide(); };
	$scope.selectCustomFilter = function(){ return 0; }
	$scope.goBack = function(){ $ionicHistory.goBack(); }

	var buildObservationObject = function(){
		for(i = 0; i < $scope.observations.length; i++){
			var projectName = '';
			var siteName = '';
			var formName = '';
			var data = [];
			var images = [];
			var formInputs = [];
			var lat = $scope.observations[i].lat;
			var lng = $scope.observations[i].lng;
			var time = $scope.observations[i].observation_time_created;
			for(j = 0; j < $scope.projects.length; j++){
				if($scope.observations[i].project_id == $scope.projects[j].id){
					projectName = $scope.projects[j].name;
				}
			}
			for(j = 0; j < $scope.sites.length; j++){
				if($scope.observations[i].site_id == $scope.sites[j].site_id){
					siteName = $scope.sites[j].site_name;
				}
			}
			for(j = 0; j < $scope.forms.length; j++){
				if($scope.observations[i].form_id == $scope.forms[j].id){
					formName = $scope.forms[j].name;
				}
			}
			for(j = 0; j < $scope.observationData.length; j++){
				if($scope.observations[i].observation_id == $scope.observationData[j].observation_id){
					data.push($scope.observationData[j]);
				}
			}
			for(j = 0; j < $scope.images.length; j++){
				if($scope.observations[i].observation_id == $scope.images[j].observation_id){
					images.push($scope.images[j]);
				}
			}
			$scope.observationObjects.push({
				projectName : projectName,
				siteName : siteName,
				formName : formName,
				data : data,
				images : images,
				lat : lat,
				lng : lng,
				time : time
			});
		}
		console.log($scope.observationObjects);
	};
	$scope.selectedObservation = '';
	$scope.setObservationObject = function(obj){
		$scope.selectedObservation = obj;
	}

	$ionicModal.fromTemplateUrl('templates/view_observation.html', {
		scope: $scope,
		animation: 'slide-in-up',
		observationObject : $scope.selectedObservation
	}).then(function(modal) {
		$scope.observationModal = modal;
	});
	$scope.openObservationModal = function() { $scope.observationModal.show(); };
	$scope.closeObservationModal = function() { $scope.observationModal.hide(); };


	$ionicModal.fromTemplateUrl('templates/view_projects.html', {
		scope: $scope,
		animation: 'slide-in-up',
		dropdowns: $scope.projects
	}).then(function(modal) {
	   $scope.viewProjectsModal = modal;
	});
	$scope.openViewProjectsModal = function() { $scope.viewProjectsModal.show(); };
	$scope.closeViewProjectsModal = function() { $scope.viewProjectsModal.hide(); };

	$ionicModal.fromTemplateUrl('templates/view_gallery.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.viewGalleryModal= modal;
	});
               
	$scope.openViewGalleryModal= function() {
		$ionicSlideBoxDelegate.slide(0);
		$scope.viewGalleryModal.show();
	};
	$scope.closeViewGalleryModal= function() { $scope.viewGalleryModal.hide(); };

       $scope.$on('$destroy', function() {
		  $scope.observationModal.remove();
		  $scope.viewProjectsModal.remove();
		  $scope.viewGalleryModal.remove();
	});
       
	$scope.$on('modal.hidden', function() { });
	$scope.$on('modal.removed', function() { });

	$scope.getObservationsByProject = function(project){
	       $scope.selectedProject = project;
	       $scope.projectSelected = true;
		console.log("View - Select Project Observations");
		console.log($scope.selectedProject);
		reset();
		$scope.showSpinner();
		var request = $http({
		    method: "post",
		    url: 'http://sciencetap.us/ionic/getViewProjectData.php',
		    data:{
			userId: $scope.user.id,
			projectId : $scope.selectedProject.id
		    }
		});
		request.success(function(data){
			console.log("Get Observations By Project - All Data");
			console.log(data);
			if (data.Status == 'Success'){
				for(var i = 0; i < data.projects.length; i++){
					$scope.projects.push(
					{
						name: data.projects[i].name,
						id: data.projects[i].id
					}
					);
				}
				for(var i = 0; i < data.sites.length; i++){
					$scope.sites.push(
					{
					    site_name: data.sites[i].site_name,
					    site_id: data.sites[i].site_id,
					    project_id: data.sites[i].project_id
					}
					);
				}
				for(var i = 0; i < data.forms.length; i++){
					$scope.forms.push(
					{
						name:  data.forms[i].form_name,
						id: data.forms[i].form_id,
						description: data.forms[i].form_description,
						project_id: data.forms[i].project_id,
						fields: []
					}
					);
				}
				for(i = 0; i < data.form_inputs.length; i++){
					$scope.form_inputs.push(
					{
					    name: data.form_inputs[i].form_input_name,
					    fieldID: data.form_inputs[i].form_input_id,
					    formID: data.form_inputs[i].form_id,
						input: '',
						form_input_type: data.form_inputs[i].form_input_type
					}
					);
				}
				for(i = 0; i < $scope.form_inputs.length; i++){
				    for(var j = 0; j < $scope.forms.length; j++){
					if($scope.forms[j].id == $scope.form_inputs[i].formID){
					    $scope.forms[j].fields.push($scope.form_inputs[i]);
					}
				    }
				}
				for(var i = 0; i < data.observations.length; i++){
					$scope.observations.push(
					{
					    observation_id : data.observations[i].observation_id,
					    form_id : data.observations[i].form_id,
					    site_id : data.observations[i].site_id,
					    project_id : data.observations[i].project_id,
					    lat : data.observations[i].lat,
					    lng : data.observations[i].lng,
					    observation_time_created: data.observations[i].observation_time_created,
					    user_id : data.observations[i].user_id
					}
					);
				}
				for(var i = 0; i < data.data.length; i++){
					$scope.data.push(
					{
					    data_id : data.data[i].data_id,
					    form_input_id : data.data[i].form_input_id,
					    data_value : data.data[i].data_value,
					    observation_id : data.data[i].observation_id
					}
					);
				}
				for(var i = 0; i < data.images.length; i++){
					$scope.images.push(
					{
					    image_id : data.images[i].image_id,
					    link : 'http://sciencetap.us/' + data.images[i].link,
					    image_name: data.images[i].image_name,
					    observation_id : data.images[i].observation_id
					}
					);
				}
				for(var i = 0; i < $scope.data.length; i++){
					var field = '';
					for(var j = 0; j < $scope.form_inputs.length; j++){
						if($scope.data[i].form_input_id == $scope.form_inputs[j].fieldID){
							field = $scope.form_inputs[j].name;
						}
					}
					$scope.observationData.push({
						field : field,
						value : $scope.data[i].data_value,
						observation_id : $scope.data[i].observation_id
					});	
				}
				buildObservationObject();
				$scope.hideSpinner();
			}
		});
		request.error( function(){
				console.log("View Error");
				$scope.hideSpinner();
		});
	}

	$scope.getObservationsByMe = function(){
		reset();
		$scope.selectedProject = noProject;
		console.log("View - Select Uploaded By Me");
		$scope.projectSelected = false;
		$scope.showSpinner();
		var request = $http({
		    method: "post",
		    url: 'http://sciencetap.us/ionic/getViewData.php',
		    data:{
			userId: $scope.user.id
		    }
		});
		request.success(function(data){
			console.log("Get Observations By Me - All Data");
			console.log(data);
			if (data.Status == 'Success'){
				for(var i = 0; i < data.projects.length; i++){
					$scope.projects.push(
					{
						name: data.projects[i].name,
						id: data.projects[i].id
					}
					);
				}
				for(var i = 0; i < data.sites.length; i++){
					$scope.sites.push(
					{
					    site_name: data.sites[i].site_name,
					    site_id: data.sites[i].site_id,
					    project_id: data.sites[i].project_id
					}
					);
				}
				for(var i = 0; i < data.forms.length; i++){
					$scope.forms.push(
					{
						name:  data.forms[i].form_name,
						id: data.forms[i].form_id,
						description: data.forms[i].form_description,
						project_id: data.forms[i].project_id,
						fields: []
					}
					);
				}
				for(i = 0; i < data.form_inputs.length; i++){
					$scope.form_inputs.push(
					{
					    name: data.form_inputs[i].form_input_name,
					    fieldID: data.form_inputs[i].form_input_id,
					    formID: data.form_inputs[i].form_id,
						input: '',
						form_input_type: data.form_inputs[i].form_input_type
					}
					);
				}
				for(i = 0; i < $scope.form_inputs.length; i++){
				    for(var j = 0; j < $scope.forms.length; j++){
					if($scope.forms[j].id == $scope.form_inputs[i].formID){
					    $scope.forms[j].fields.push($scope.form_inputs[i]);
					}
				    }
				}
				for(var i = 0; i < data.observations.length; i++){
					$scope.observations.push(
					{
					    observation_id : data.observations[i].observation_id,
					    form_id : data.observations[i].form_id,
					    site_id : data.observations[i].site_id,
					    project_id : data.observations[i].project_id,
					    lat : data.observations[i].lat,
					    lng : data.observations[i].lng,
					    observation_time_created: data.observations[i].observation_time_created,
					    user_id : data.observations[i].user_id
					}
					);
				}
				for(var i = 0; i < data.data.length; i++){
					$scope.data.push(
					{
					    data_id : data.data[i].data_id,
					    form_input_id : data.data[i].form_input_id,
					    data_value : data.data[i].data_value,
					    observation_id : data.data[i].observation_id
					}
					);
				}
				for(var i = 0; i < data.images.length; i++){
					$scope.images.push(
					{
					    image_id : data.images[i].image_id,
					    link : 'http://sciencetap.us/' + data.images[i].link,
					    image_name: data.images[i].image_name,
					    observation_id : data.images[i].observation_id
					}
					);
				}
				for(var i = 0; i < $scope.data.length; i++){
					var field = '';
					for(var j = 0; j < $scope.form_inputs.length; j++){
						if($scope.data[i].form_input_id == $scope.form_inputs[j].fieldID){
							field = $scope.form_inputs[j].name;
						}
					}
					$scope.observationData.push({
						field : field,
						value : $scope.data[i].data_value,
						observation_id : $scope.data[i].observation_id
					});	
				}
				buildObservationObject();
				$scope.hideSpinner();
			}
		});
		request.error( function(){
				console.log("View Error");
				$scope.hideSpinner();
		});
	}

	var request = $http({
	    method: "post",
	    url: 'http://sciencetap.us/ionic/getViewData.php',
	    data:{
		userId: $scope.user.id
	    }
	});
	$scope.showSpinner();
	request.success(function(data){
		$scope.observationObjects = [];
		console.log(data);
		if (data.Status == 'Success'){
			for(var i = 0; i < data.projects.length; i++){
				$scope.projects.push(
				{
					name: data.projects[i].name,
					id: data.projects[i].id
				}
				);
			}
			for(var i = 0; i < data.sites.length; i++){
				$scope.sites.push(
				{
				    site_name: data.sites[i].site_name,
				    site_id: data.sites[i].site_id,
				    project_id: data.sites[i].project_id
				}
				);
			}
			for(var i = 0; i < data.forms.length; i++){
				$scope.forms.push(
				{
					name:  data.forms[i].form_name,
					id: data.forms[i].form_id,
					description: data.forms[i].form_description,
					project_id: data.forms[i].project_id,
					fields: []
				}
				);
			}
			for(i = 0; i < data.form_inputs.length; i++){
				$scope.form_inputs.push(
				{
				    name: data.form_inputs[i].form_input_name,
				    fieldID: data.form_inputs[i].form_input_id,
				    formID: data.form_inputs[i].form_id,
					input: '',
					form_input_type: data.form_inputs[i].form_input_type
				}
				);
			}
			for(i = 0; i < $scope.form_inputs.length; i++){
			    for(var j = 0; j < $scope.forms.length; j++){
				if($scope.forms[j].id == $scope.form_inputs[i].formID){
				    $scope.forms[j].fields.push($scope.form_inputs[i]);
				}
			    }
			}
			for(var i = 0; i < data.observations.length; i++){
				$scope.observations.push(
				{
				    observation_id : data.observations[i].observation_id,
				    form_id : data.observations[i].form_id,
				    site_id : data.observations[i].site_id,
				    project_id : data.observations[i].project_id,
				    lat : data.observations[i].lat,
				    lng : data.observations[i].lng,
				    observation_time_created: data.observations[i].observation_time_created,
				    user_id : data.observations[i].user_id
				}
				);
			}
			for(var i = 0; i < data.data.length; i++){
				$scope.data.push(
				{
				    data_id : data.data[i].data_id,
				    form_input_id : data.data[i].form_input_id,
				    data_value : data.data[i].data_value,
				    observation_id : data.data[i].observation_id
				}
				);
			}
			for(var i = 0; i < data.images.length; i++){
				$scope.images.push(
				{
				    image_id : data.images[i].image_id,
				    link : 'http://sciencetap.us/' + data.images[i].link,
				    image_name: data.images[i].image_name,
				    observation_id : data.images[i].observation_id
				}
				);
			}
			for(var i = 0; i < $scope.data.length; i++){
				var field = '';
				for(var j = 0; j < $scope.form_inputs.length; j++){
					if($scope.data[i].form_input_id == $scope.form_inputs[j].fieldID){
						field = $scope.form_inputs[j].name;
					}
				}
				$scope.observationData.push({
					field : field,
					value : $scope.data[i].data_value,
					observation_id : $scope.data[i].observation_id
				});	
			}
			buildObservationObject();
			$scope.hideSpinner();
		}
	});
	request.error( function(){
			console.log("View Error");
			$scope.hideSpinner();
	});

});

app.controller('HomeCtrl', function($scope, $ionicPopup, $state, $cordovaGeolocation, $ionicLoading, $compile, $ionicModal, $ionicHistory, $http, $ionicSlideBoxDelegate, Camera, LoginService, $ionicLoading, $ionicScrollDelegate){
	$scope.user = {};
	$scope.user.firstName = window.localStorage.getItem("firstName");
	$scope.user.role = window.localStorage.getItem("role");
	$scope.user.email = window.localStorage.getItem("email");
	$scope.user.phone = window.localStorage.getItem("phone");
	$scope.user.id = window.localStorage.getItem("userId");
	$scope.user.lastName = window.localStorage.getItem("lastName");
	$scope.projects = [];
	$scope.isAdmin = window.localStorage.getItem("admin");

	$scope.logout = function(){
		window.localStorage.removeItem('loggedInUser');
		$state.go('login');
	}
	var request = $http({
	    method: "post",
	    url: 'http://sciencetap.us/ionic/getHomeData.php',
	    data:{
		userId: $scope.user.id
	    }
	});
	request.success(function(data){
		if (data.Status == 'Success'){
			console.log("In Home");
			console.log(data);
			console.log("Home projects");
			console.log(data.projects);
			console.log("Home role");
			console.log(data.role);
			window.localStorage.setItem("role", data.role);
			for(var i = 0; i < data.projects.length; i++){
				$scope.projects.push(
				{
				    name: data.projects[i].name,
				    id: data.projects[i].id
				}
				);
			}
		}
	});
	request.error(function(){
		console.log("error in Home AJAX");
	});

});

app.service('LoginService', function($q, $http, $state){
	return{ 
		loginUser: function(name, pw){
			var deferred = $q.defer();
			var promise = deferred.promise;

			if(name == "" || name == null ){
				deferred.reject('Wrong credentials');
				window.localStorage.removeItem('loggedInUser');
			}else{
				deferred.resolve('Welcome ' + name + '!');
			}
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;
		}
	}
})

app.factory('Camera', ['$q', function($q) {
  return {
    getPicture: function(options) {
      var q = $q.defer();
      navigator.camera.getPicture(function(result) {
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);
      return q.promise;
    },
    getGallery: function(options) {
      var q = $q.defer();
      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);
      return q.promise;
    }
  }
}]);


app.directive('compareStrings', function(){
	return{
		require: "ngModel",
		link: function(scope, element, attributes, ngModel){
				ngModel.$validators.compareTo = function(modelValue){
					return modelValue == scope.otherModelValue;
				};

				scope.$watch("otherModelValue", function(){
					ngModel.$validate();
				});

			}

	};
}); 

app.factory('Markers', function($http){
	var markers = [];
	return{
		getMarkers: function(){
			return $http.get("http://sciencetap.us/ionic/getMarkers.php").then(function(response){
				markers = response;
				return markers;
			});
		}
	}
})

app.factory('GoogleMaps', function($cordovaGeolocation, $ionicPopup, $ionicLoading, $rootScope, $cordovaNetwork, Markers, ConnectivityMonitor){

	var apiKey = false;
	var map = null;

	function initMap(){
		var options = {timeout: 10000, enableHighAccuracy: true};

		$cordovaGeolocation.getCurrentPosition(options).then(function(position){

			var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			var mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			layer = new google.maps.FusionTablesLayer({
				query: {
					select: 'geometry',
					from: '1_kb24whPAZttu2FPYLAFPUAUb8f6PNnSUL48TzX7'
				},
				options: {
					styleId: 3,
					templateId: 4,
					strokeWeight: 3 
				}
			});
			map = new google.maps.Map(document.getElementById("map"), mapOptions);
			layer.setMap(map);

			var GeoMarker = new GeolocationMarker(map);

			//wait until map loads
			google.maps.event.addListenerOnce(map, 'idle', function(){
				loadMarkers();
				enableMap();
			});

		}, function(error){
			console.log("Could not get location");
			enableMap();
		});
	}

	function enableMap(){
		$ionicLoading.hide();
	}

	function disableMap(){
		$ionicLoading.show({
			template: 'You must be connected to the Internet to view this map'
		});
	}
	var warnNoConnection = function(){
		var popup = $ionicPopup.alert({
			title: 'Network Connection Lost',
			template: 'The network connection was lost, this will prevent the map from updating, and the ability to submit data'
		});
		popup.then(function(res){ ; });
	};

	function loadGoogleMaps(){
		//$ionicLoading.show({ template: 'Loading Map' });

		//function called once SDK loaded
		window.mapInit = function(){
			var geoScript = document.createElement("script");
			geoScript.type = "text/javascript";
			geoScript.id = "geolocationMarker";
			geoScript.src = "js/geolocation-marker.js";
			document.body.appendChild(geoScript);
			initMap();
		};

		//create script element to insert API key
		if(document.getElementById("googleMaps") == null){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.id = "googleMaps";
			if(apiKey){
				script.src = 'http://maps.google.com/maps/api/js?key=' + apiKey + '&sensor=true&callback=mapInit';
			}else{
				script.src = 'http://maps.google.com/maps/api/js?sensor=true&callback=mapInit';
			}
			document.body.appendChild(script);
		}
	}

	function checkLoaded(){
		if(typeof google == "undefined" || typeof google.maps == "undefined"){
			loadGoogleMaps();
		}else{
			enableMap();
		}
	}

	function loadMarkers(){
		Markers.getMarkers().then(function(markers){
			console.log(markers.data);
			var records = markers.data.sites;
			for(var i = 0; i < records.length; i++){
				var record = records[i];
				var markerPos = new google.maps.LatLng(record.site_lat, record.site_lon);
				var marker = new google.maps.Marker({
					map: map,
					animation: google.maps.Animation.DROP,
					position: markerPos 
				});
				var infoWindowContent = "<h4>Project: " + record.project_name + "</h4>";
				infoWindowContent += "<h5>Site: " + record.site_name + "</h5>";
				infoWindowContent += "<h6>" + record.site_description + "</h6>";
				addInfoWindow(marker, infoWindowContent, record);
			}
		});
	}

	function addInfoWindow(marker, message, record){
		var infoWindow = new google.maps.InfoWindow({
			content: message
		});
		google.maps.event.addListener(marker, 'click', function(){
			infoWindow.open(map, marker);
		});
	}

	function addConnectivityListeners(){
		if(ionic.Platform.isWebView()){
			//check to load map
			$rootScope.$on('$cordovaNetwork:online', function(event, networkState){
				checkLoaded();
			});
			//disable map if offline
			$rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
				warnNoConnection();
			});
		}else{
			//for not running on a device
			window.addEventListener("online", function(e){
				checkLoaded();
			},false);
			window.addEventListener("offline", function(e){
				warnNoConnection();
			},false);
		}
	}

	return{
		init: function(key){
			if(typeof key != "undefined"){
				apiKey = key;
			}
			if(typeof google =="undefined" || typeof google.maps == "undefined"){
				console.warn("Google Maps SDK needs to be loaded");
				var networkState = navigator.connection.type;
				console.log(networkState);
				if(ConnectivityMonitor.isOnline()){
					loadGoogleMaps();
				}
			}else{
				if(ConnectivityMonitor.isOnline()){
					console.log("right here");
					initMap();
					enableMap();
				}else{
					warnNoConnection();
				}
			}
			console.log("but");
			addConnectivityListeners();
		}
	}
})

app.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){
	return{
		isOnline: function(){
			if(ionic.Platform.isWebView()){
				console.log("here");
				return $cordovaNetwork.isOnline();
			}else{
				console.log("there");
				return navigator.onLine;
			}
		},
		isOffline: function(){
			if(ionic.Platform.isWebView()){
				return !$cordovaNetwork.isOnline();
			}else{
				return !navigator.onLine;
			}
		}
	}
})
