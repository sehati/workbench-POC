const workbenchPDFs = {
  file11: {
    myBounds: {
      maxX: 36208,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  },
  file12: {
    myBounds: {
      maxX: 36192,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  },
  file13: {
    myBounds: {
      maxX: 36208,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  },
  file14: {
    myBounds: {
      maxX: 36192,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  },
};
var map = L.map("map").setView([0, 0], 1);

L.TileLayer.pdf = L.TileLayer.extend({
  getTileUrl: function (coords) {
    const tileUrl = L.TileLayer.prototype.getTileUrl.call(this, coords);
    const completeTileUrl = `https://sp-projects-files-v1-dev.s3-ap-southeast-2.amazonaws.com/${CryptoJS.MD5(
      tileUrl
    )}/${tileUrl}`;
    console.log(completeTileUrl);
    return completeTileUrl;
  },
  coordsIsValid(coords, bounds, zoomLevelsProperties) {
    var tileSize = 256;
    const maxX = Math.abs(bounds.maxX - bounds.minX);
    const maxY = Math.abs(bounds.maxY - bounds.minY);
    const zoomLevelProperties = zoomLevelsProperties.filter(
      (value) => value.order === coords.z
    );
    if (!!zoomLevelProperties?.[0]?.unitPerPixel) {
      const unitPerPixel = zoomLevelProperties[0].unitPerPixel;
      const tilesMaxColumns = Math.floor(maxX / tileSize / unitPerPixel);
      const tilesMaxRows = Math.floor(maxY / tileSize / unitPerPixel);
      return (
        coords.z >= 0 &&
        coords.x >= 0 &&
        coords.y >= 0 &&
        coords.x <= tilesMaxColumns &&
        coords.y <= tilesMaxRows
      );
    }

    return coords.z >= 0 && coords.x >= 0 && coords.y >= 0; // && (isCoordsValidForFileMetadata(coords, fileMetadata));
  },
  getMaxColumnRow(bounds, minZoomLevelProperty) {
    var tileSize = 256;
    const maxX = Math.abs(bounds.maxX - bounds.minX);
    const maxY = Math.abs(bounds.maxY - bounds.minY);
    const unitPerPixel = minZoomLevelProperty.unitPerPixel;
    const tilesMaxColumns = maxX / tileSize / unitPerPixel;
    const tilesMaxRows = maxY / tileSize / unitPerPixel;
    return {
      tilesMaxColumns,
      tilesMaxRows,
    };
  },

  createTile: function (coords) {
    var tile = document.createElement("img");
    tile.innerHTML = [coords.x, coords.y, coords.z].join(", ");
    // tile.style.outline = "1px solid red";
    let leftOffset = 0;
    let leftPixels = 0;
    for (let x = 1; x <= this.options.left; x++) {
      maxColumnRow = this.getMaxColumnRow(
        workbenchPDFs[`file${this.options.top + 1}${x}`].myBounds,
        workbenchPDFs[
          `file${this.options.top + 1}${x}`
        ].zoomLevelsProperties.filter((value) => value.order === coords.z)[0]
      );
      leftOffset = maxColumnRow.tilesMaxColumns + leftOffset;
    }
    // console.log(this.options.left, leftOffset);
    coords.x = coords.x - parseInt(leftOffset);
    const translateX = (leftOffset - parseInt(leftOffset)) * 256;
    console.log(translateX, this.options.left);
    const regex = /(\d+)px/;
    setTimeout(function () {
      // console.log(tile.style.transform.replace(regex, matcher));
      tile.style.transform = tile.style.transform.replace(
        regex,
        function (match, p1, p2, p3) {
          return `${parseInt(p1) + translateX + ""}px`;
        }
      );
    }, 100);
    // tile.style.transform = `translateX(${
    //   (leftOffset - parseInt(leftOffset)) *
    //   this.options.zoomLevelsProperties[coords.z]
    // }px)`;
    coords.y = Math.ceil(
      coords.y -
        this.getMaxColumnRow(
          this.options.myBounds,
          this.options.zoomLevelsProperties[coords.z]
        ).tilesMaxRows *
          this.options.top
    );
    if (
      this.coordsIsValid(
        coords,
        this.options.myBounds,
        this.options.zoomLevelsProperties
      )
    ) {
      const tileUrl = this.getTileUrl(coords);
      tile.setAttribute("src", tileUrl);
    }
    return tile;
  },

  getAttribution: function () {
    return "<a href='https://placekitten.com/attribution.html'>PlaceKitten</a>";
  },
});

file1 = new L.TileLayer.pdf(
  "feb243e6-a047-4a00-a446-12cef6b3df6a/fa1d931e-19fc-11ec-b5e5-8a1a0b6c6c3d/{z}/{x}/{y}.png",
  {
    // zoomOffset: -1,
    noWrap: true,
    top: 0,
    left: 0,
    myBounds: {
      maxX: 36208,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  }
);

map.addLayer(file1);
file2 = new L.TileLayer.pdf(
  "feb243e6-a047-4a00-a446-12cef6b3df6a/fa1d7f85-19fc-11ec-b5e5-8a1a0b6c6c3d/{z}/{x}/{y}.png",
  {
    // zoomOffset: -1,
    noWrap: true,
    top: 0,
    left: 1,
    myBounds: {
      maxX: 36192,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  }
);

map.addLayer(file2);

file3 = new L.TileLayer.pdf(
  "feb243e6-a047-4a00-a446-12cef6b3df6a/fa1d964f-19fc-11ec-b5e5-8a1a0b6c6c3d/{z}/{x}/{y}.png",
  {
    // zoomOffset: -1,
    top: 0,
    noWrap: true,
    left: 2,
    myBounds: {
      maxX: 36208,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  }
);

map.addLayer(file3);
file4 = new L.TileLayer.pdf(
  "feb243e6-a047-4a00-a446-12cef6b3df6a/fa1d8f57-19fc-11ec-b5e5-8a1a0b6c6c3d/{z}/{x}/{y}.png",
  {
    // zoomOffset: -1,
    noWrap: true,
    top: 0,
    left: 3,
    myBounds: {
      maxX: 36192,
      maxY: 0,
      minX: 0,
      minY: -102384,
    },
    zoomLevelsProperties: [
      { unitPerPixel: 256, order: 1 },
      { unitPerPixel: 128, order: 2 },
      { unitPerPixel: 64, order: 3 },
      { unitPerPixel: 32, order: 4 },
      { unitPerPixel: 16, order: 5 },
      { unitPerPixel: 8, order: 6 },
      { unitPerPixel: 4, order: 7 },
      { unitPerPixel: 2, order: 8 },
      { unitPerPixel: 1, order: 9 },
    ],
  }
);

map.addLayer(file4);
