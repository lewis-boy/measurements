import { getProducts } from "../data/products.js"
import ProductCard from "../components/ProductCard.jsx"
import Product3DViewer from "../components/Product3DViewer.jsx"
import { createProductModel } from "../models/createProductModel.js"
import { createKeycapModel } from "../models/createProductModel.js"
import Keycap3D from "../components/Keycap.jsx"
export default function Home() {
    const products = getProducts()
    return (
        <div className="page">
            <div className="home-hero">
                <h1 className="home-title">Welcome to ShopHub</h1>
                <p>Discover amazing products at great prices</p>
                <Keycap3D color="#B22222" legendColor="#ff4fa3" />
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
