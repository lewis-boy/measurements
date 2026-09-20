import Product3DViewer from "./Product3DViewer"
import { createKeycapModel } from "../models/createProductModel.js"

export default function Keycap3D({ color = "#f2f1ed", legendColor = "#ff4fa3", showLegend = true }) {
    return (
        <Product3DViewer
            createModel={() =>
                createKeycapModel({
                    color,
                    legendColor,
                    showLegend,
                })
            }
        />
    )
}
