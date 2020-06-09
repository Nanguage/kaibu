const itkVtkViewer = window.itkVtkViewer;

export async function setupImJoyAPI({ addLayer }) {
  const imjoyRPC = await window.imjoyLoader.loadImJoyRPC({
    api_version: "0.2.3"
  });

  const api = await imjoyRPC.setupRPC({
    name: "Kaibu",
    version: "0.1.0",
    description:
      "Kaibu--a web application for visualizing and annotating multi-dimensional images",
    type: "rpc-window"
  });

  api.registerCodec({
    name: "itkimage",
    decoder: itkVtkViewer.utils.convertToItkImage
  });
  api.registerCodec({
    name: "ndarray",
    decoder: itkVtkViewer.utils.ndarrayToItkImage
  });

  const service_api = {
    setup() {
      api.log("Kaibu loaded successfully.");
    },
    async run(ctx) {
      if (ctx.data && ctx.data.image_array) {
        await this.imshow(ctx.data.image_array);
      } else if (ctx.data && ctx.data.layers) {
        for (let layer of ctx.data.layers) {
          addLayer(layer);
        }
      }
    },
    addLayer: addLayer,
    async view_image(image_array, config) {
      config = config || {};
      const vtkImage = itkVtkViewer.utils.vtkITKHelper.convertItkToVtkImage(
        image_array
      );
      config.type = "itk-vtk";
      config.data = vtkImage;
      addLayer(config);
    },
    async add_shapes(shape_array, config) {
      config = config || {};
      config.type = "vector";
      config.data = shape_array;
      addLayer(config);
    },
    async add_points(point_array, config) {
      config = config || {};
      config.type = "vector";
      config.data = [point_array];
      config.shape_type = "Point";
      addLayer(config);
    }
  };

  api.export(service_api);
}
