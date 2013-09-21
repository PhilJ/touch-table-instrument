// Touch Table Instrument Interface
var touchTable = TouchTable.init({
	pixels: {
		rows: 6,
		cols: 8,
		device: '/dev/spidev0.0',
		wireing: {
			startX: 'left',
			startY: 'top',
			direction: 'vetical'
		}
	},
	touch: {
		device: '/dev/ttyAMA0',
		delimiter: "\n\n\n"
	}
});

// Module: Light touched pixel
touchTable.module('demo1', function () {
	
	return {
		init: function (pixels) {
			pixels.fill('000000');
		},
		onTouch: function (event, pixels) {
			pixels.select(event.touched).fill('FFFFFF');
		},
		onRelease: function (event, pixels) {
			pixels.select(event.released).fill('000000');
		}
	};
});

touchTable.shape('fade', function () {
	function calculateFade (startColor, endColor, duration, ease) {
		// calculate array with fade color
		return ['000000', '050505', '111111', ...];
	}

	return {
		defaults: {
			startColor: '000000',
			endColor: 'FFFFFFF',
			duration: 25,
			ease: 'ease'
		}
		init: function (selectedPixels, params) {		
			this.pixels = selectedPixels;
			this.colors = calculateFade(params.startColor, params.endColor, params.duration, params.ease);
			// shape will automatically be removed on timeout
			this.timeout = params.duration;
		},
		next: function () {
			// this.tick is automatically incremented
			var nextColor = this.color[ this.tick ];
			this.pixels.fill( nextColor );
		}
	}; 
});