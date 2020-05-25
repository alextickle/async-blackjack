import React from "react";

const Hand = ({cards, title}) => {
    return (
        <div>
            <div className="row">
                <div className="col-sm-3 offset-sm-5">
                    {title}
                </div>
            </div>
            <div className="row">
                <div className="col-sm-11 offset-sm-1">
                    {Array.isArray(cards) && cards.map((card, i) => {
                        return <img width="100" height="175" key={i} src={card.image}/>;
                    })}
                </div>
            </div>
        </div>
    );
}

export default Hand;