var touchTable = angular.module('TouchTable', ['ngTouch']);

touchTable.controller('TouchTableController', function ($scope, socket) {
	$scope.foo = "bar";
	$scope.socket = socket;
	$scope.touch = [];
	$scope.pixelSize = 40;


	$scope.$watch('size', function (size) {
		if (size && size[0] && size[1]) {
			var touchMatrix = [];
			for (var r = 0; r < size[0]; r++) {
				var row = [];
				for (var c = 0; c < size[1]; c++) {
					row.push(0);
				}
				touchMatrix.push(row);
			}
			$scope.touch = touchMatrix;

			var height = jQuery(window).height() - 100;
			var width  = jQuery(window).width()  - 100;
			var maxPixelWidth = Math.floor( width / size[0] ) ;
			var maxPixelHeight = Math.floor( height / size[1] );
			$scope.pixelSize = (maxPixelWidth < maxPixelHeight) ? maxPixelWidth : maxPixelHeight;
		}
		
	});

	$scope.socket.on('setup', function (e) {
		$scope.$apply(function () {
			$scope.size = e.size;
		});
	});

	$scope.socket.on('render', function (e) {
		$scope.$apply(function () {
			$scope.pixels = e.pixels;
		});
	});

	$scope.$watch('touch', function (newVal) {
		console.log("Touch changed");
		$scope.socket.emit('touch', {touch: newVal});
	}, true);

	/*$scope.touchButton = function (position) {
		$scope.touch[ position[0] ][ position[1] ] = ($scope.touch[ position[0] ][ position[1] ] === 0) ? 1 : 0;
		console.log("Touch", $scope.touch[ position[0] ][ position[1] ] === 1 ? "on" : "off", position)
		$scope.socket.emit('touch', {touch: $scope.touch});
		console.log($scope.touch);
	};
	$scope.releaseButton = function (position) {
		console.log("Release", position)
		$scope.touch[ position[0] ][ position[1]] = 0;
		$scope.socket.emit('touch', {touch: $scope.touch});;
	};*/

	jQuery(document).bind('touchstart', function (event) {
		//event.preventDefault();
	});
});

touchTable.factory('socket', function ($location) {
	var socket = io.connect('http://' + $location.host() + ':' + $location.port());
	return socket;
});


touchTable.directive('buttonTouch', function ($swipe) {
	return function(scope, element, attrs) {

		var y = scope.$index;
		var x = scope.$parent.$index;

		var onTouch = function () {
			scope.touch[x][y] = 1;
			scope.$apply();
			//scope.$parent.$parent.touch.matrix[x][y] = 1;
			//scope.$parent.$parent.$apply();
		};

		var onRelease = function () {
			scope.touch[x][y] = 0;
			scope.$apply();
		};

		/*Hammer(element[0]).on("touch", function(event) {
			//event.gesture.stopPropagation();
			//event.preventDefault();
			//event.gesture.stopPropagation();
			event.gesture.preventDefault();
        	onTouch();
    	});

    	Hammer(element[0]).on("drag", function(event) {
			//event.gesture.stopPropagation();
			//event.preventDefault();
			//event.gesture.stopPropagation();
			event.gesture.preventDefault();
        	onTouch();
    	});

    	Hammer(element[0]).on("release", function(event) {
			// event.stopPropagation();
			// event.preventDefault();
			event.gesture.stopPropagation();
			event.gesture.preventDefault();
        	onRelease();
    	});*/

		element.bind('mouseover mousemove click', function(event) {
			onTouch();
			//var changedTouches = event.changedTouches();
			//console.log(changedTouches);
			//event.preventDefault();
    	});

		element.bind('mouseout', function(event) {
			onRelease();
    	});


		/*$swipe.bind(element, {
			start: onTouch,
			move: onTouch,
			cancel: onRelease,
			end: onRelease
		});*/

		console.log("Bound button ", x, y);
	}
});