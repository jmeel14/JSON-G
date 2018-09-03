/* This script takes a given JSON-G large string/object and attempts to render it as an image, and provide a downloadable file.
   Invalid renders, such as pixel positions larger than given image dimensions and colours will be alerted in the final code output.
*/

// Execute scripts at document load completion.
(function(){
    // Example image object
	var JSON_G_OBJ = {
		"version" : "1.0",
		"comment" : "demo.jsng - a demo for JSON-G",
		"transparency" : true,
		"size":
			{
				"width": 5,
				"height": 5
			},
		"layers" :
			[
				{
					"default_color" :
						{
							"red" : 0,
							"green" : 0,
							"blue" : 0,
							"alpha" : 255
						},
					"pixels" :
						[
							{
								"position" :
									{
										"x" : 2,
										"y" : 2
									},
								"color" :
									{
										"red" : 255,
										"green" : 255,
										"blue" : 255,
										"alpha" : 255
									},
								"comment" : "A nice white pixel."
							}
						]
				}
			]
	};
	
	
	// Crates an error div with a title and content.
	function generate_error(errParent, errTitle, errContent, errRaw){
		errParent.innerHTML = null;
		var errElem = document.createElement('div');
		errElem.setAttribute('class', 'error');
		
		var errTitleElem = document.createElement('div');
		errTitleElem.setAttribute('class', 'errTitle');
		errTitleElem.innerHTML = errTitle;
		errElem.appendChild(errTitleElem);
		
		var errContentElem = document.createElement('div');
		errContentElem.setAttribute('class', 'errDescription');
		errContentElem.innerHTML = errContent;
		errElem.appendChild(errContentElem);
		
		var errRawElem = document.createElement('div');
		errRawElem.setAttribute('class', 'errRaw');
		errRawElem.innerHTML = errRaw;
		errElem.appendChild(errRawElem);
		
		errParent.appendChild(errElem);
	}

	var DRAW_ELEM = document.getElementById('render_canv');

	function canv_pixel_render(render_canv_context, image_size_data, pixel_data){
		// Renders pixel_data pixel onto render_canv canvas 2dContext.
		render_canv_context.fillStyle = `rgba(
			${pixel_data.color.red},
			${pixel_data.color.blue},
			${pixel_data.color.green},
			${(pixel_data.color.alpha / 255).toFixed(2)}
		)`;
		if( // Checklist to make sure pixel co-ordinates aren't smaller than 0, and not larger than image dimensions.
			( pixel_data.position.x >= 0 && pixel_data.position.x < image_size_data.width )
		&&
			( pixel_data.position.y >= 0 && pixel_data.position.y < image_size_data.height )
		)
		{
			render_canv_context.fillRect(pixel_data.position.x, pixel_data.position.y, 1, 1);
			return true;
		}
		else {
			return false;
		}
	}

	function canv_layer_render(render_canv_context, image_size_data, layer_data){
		// Renders per layer of image data.

		// Sets an rgba(VALUE,VALUE,VALUE,VALUE) string value on the canvas render context for data.
		// Also, converts 255 value to 1.00 value for alpha.
		let color_filler = `rgba(
			${layer_data.default_color.red},
			${layer_data.default_color.blue},
			${layer_data.default_color.green},
			${(layer_data.default_color.alpha / 255).toFixed(2)},
		)`;

		// Renders the layer set to the width and height of the image.
		render_canv_context.fillRect(0, 0, image_size_data.width, image_size_data.height);

		// Counter that stores pixels.
		var pixel_offsets = [];

		// Loop that reads pixels in the layer's pixel data, and
		// if their position is either smaller than 0 or larger than image dimension in either axis
		for(let pxl = 0; pxl < layer_data.pixels.length; pxl++){
			var pixel_offset = canv_pixel_render(render_canv_context, image_size_data, layer_data.pixels[pxl]);
			if(pixel_offset === false){ pixel_offsets.push(layer_data.pixels[pxl]); }
		}
		return [true, pixel_offsets];

	}

	function canv_render_main(render_canv, jsong_to_render){
		// Draws image data retrieved from JSON-G data onto HTML canvas element.

		if(typeof jsong_to_render == "string"){
			try{
				var jsong_obj = JSON.parse(jsong_to_render);
			}
			catch(e){
				generate_error(
					document.getElementById('err_zone'),
					'Invalid JSON-G',
					'The JSON you have inserted is either invalid, not parseable, or does not fit the requirements of a JSON-G object. The code output is the following:',
					e.toString()
				);
				return null;
			}
		}
		else {
			var jsong_obj = jsong_to_render;
		}

		render_canv.width = jsong_obj.size.width;
		render_canv.height = jsong_obj.size.height;

		// Creates a context, and then empties it to ensure the canvas is empty before rendering.
		var canv_context = render_canv.getContext('2d');
		canv_context.clearRect(0, 0, render_canv.width, render_canv.height);
		// Loop that reads layers from JSON-G object.
		for(let lyr = 0; lyr < jsong_obj.layers.length; lyr++){
			canv_layer_render(canv_context, jsong_obj.size, jsong_obj.layers[lyr]);
		}
	}
	
	// For user input, grabs the specific elements that users interact with.
	var JSONG_IN_ELEM = document.getElementById("json_input");
	var JSONG_SUB_ELEM = document.getElementById("json_submit");

	// Fires the canvas renderer on user interaction.
	JSONG_SUB_ELEM.addEventListener('click', function(){
		var fired_render = canv_render_main(DRAW_ELEM, JSONG_IN_ELEM.value)
	});
})();