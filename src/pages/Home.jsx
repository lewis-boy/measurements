import { getProducts } from "../data/products.js"
import { Link } from "react-router-dom"
export default function Home() {
    const products = getProducts()
    return (
        <div className="page">
            <div className="home-hero">
                <h1 className="home-title">Welcome to ShopHub</h1>
                <p>Discover amazing products at great prices</p>
            </div>
            <div className="container">
                <h2 className="page-title">Our Products</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <div className="product-card" key={product.id}>
                            <img
                                src={product.image}
                                className="product-card-image"
                            />
                            <div className="product-card-content">
                                <h3 className="product-card-name">
                                    {product.name}
                                </h3>
                                <p className="product-card-price">
                                    ${product.price}
                                </p>
                                <div className="product-card-actions">
                                    <button className="btn btn-primary">
                                        Add to cart
                                    </button>
                                    <Link className="btn btn-secondary">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
