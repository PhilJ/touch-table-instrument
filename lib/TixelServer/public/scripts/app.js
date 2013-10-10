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
				for (var c = 0; c < size [1]; c++) {
					row.push(0);
				}
				touchMatrix.push(row);
			}
			$scope.touch = touchMatrix;

			var height = jQuery(window).height() - 60;
			var width  = jQuery(window).width()  - 60;
			var maxPixelWidth = Math.floor( width / size[1] ) ;
			var maxPixelHeight = Math.floor( height / size[0] );
			$scope.pixelSize = (maxPixelWidth < maxPixelHeight) ? maxPixelWidth : maxPixelHeight;
		}
		
	});

	$scope.socket.on('setup', function (e) {
		$scope.$apply(function () {
			$scope.size = e.size;
		});
		console.log("Setup with size: ", e.size);
	});

	$scope.socket.on('render', function (e) {

		$scope.$apply(function () {
			$scope.pixels = e.pixels;
		});
	});

	$scope.touchButton = function (position) {
		console.log(position)
		$scope.touch[ position[0] ][ position[1]] = 1;
		$scope.socket.emit('touch', {touch: $scope.touch});
		console.log($scope.touch);
	};
	$scope.releaseButton = function (position) {
		console.log(position)
		$scope.touch[ position[0] ][ position[1]] = 0;
		$scope.socket.emit('touch', {touch: $scope.touch});;
	};
});

touchTable.factory('socket', function () {
	var socket = io.connect('http://localhost:3000');
	return socket;
});