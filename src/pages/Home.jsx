import { getProducts } from "../data/products.js"
import ProductCard from "../components/ProductCard.jsx"
import Product3DViewer from "../components/Product3DViewer.jsx"
import { createProductModel } from "../models/createProductModel.js"
import { createInstancedKeycapRainModel } from "../models/createInstancedKeycapRainModel.js"
export default function Home() {
    const products = getProducts()
    return (
        <div className="page">
            <div className="keycap-rain">
                <Product3DViewer
                    centerModel={false}
                    createModel={() =>
                        createInstancedKeycapRainModel({
                            count: 12,
                            spreadX: 8,
                            spreadY: 16,
                            spreadZ: 3,
                            fallSpeed: 0.5,
                            spacing: 3,
                            centerGap: 3,
                        })
                    }
                />
            </div>
            <div className="home-hero">
                <h1 className="home-title">Welcome to ShopHub</h1>
                <p>Discover amazing products at great prices</p>
            </div>
            <div className="container">
                <h2 className="page-title">Our Products</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard product={product} key={product.id} />
                    ))}
                </div>
            </div>
        </div>
    )
}
