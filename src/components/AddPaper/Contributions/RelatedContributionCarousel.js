import React, { Component } from 'react';
import styled from 'styled-components';
import RelatedContribution from './RelatedContribution';
import PropTypes from 'prop-types';
import { Carousel, CarouselItem, CarouselIndicators } from 'reactstrap';

const StyledCarousel = styled(Carousel)`
    .carousel-indicators li{
        background-color: darkgray !important;
    }
`;

const StyledCarouselIndicators = styled(CarouselIndicators)`
    
`;

class RelatedContributionCarousel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0
        };
    }

    onExiting = () => {
        this.animating = true;
    }

    onExited = () => {
        this.animating = false;
    }

    next = () => {
        if (this.animating) { return };
        const nextIndex = this.state.activeIndex === this.props.contributions.length - 1 ? 0 : this.state.activeIndex + 1;
        this.setState({ activeIndex: nextIndex });
    }

    previous = () => {
        if (this.animating) { return };
        const nextIndex = this.state.activeIndex === 0 ? this.props.contributions.length - 1 : this.state.activeIndex - 1;
        this.setState({ activeIndex: nextIndex });
    }

    goToIndex = (newIndex) => {
        if (this.animating) { return };
        this.setState({ activeIndex: newIndex });
    }

    render() {
        const { activeIndex } = this.state;
        const slides = this.props.contributions.filter(function (el) { return el != null; }).map((contribution, index) => {
            return (
                <CarouselItem
                    onExiting={this.onExiting}
                    onExited={this.onExited}
                    key={index}
                >
                    <RelatedContribution
                        openDialog={this.props.openDialog}
                        dropped={this.props.dropped}
                        key={`s${this.props.id}${contribution.id}`}
                        id={contribution.id}
                        authors={this.props.authors}
                        label={this.props.label}
                        contribution={contribution}
                        showContributionLabel={true}
                    />
                </CarouselItem>
            );
        });

        return (
            <StyledCarousel
                activeIndex={activeIndex}
                next={this.next}
                previous={this.previous}
            >
                <StyledCarouselIndicators
                    items={this.props.contributions.filter(function (el) { return el != null; })}
                    activeIndex={activeIndex}
                    onClickHandler={this.goToIndex}
                />
                {slides}
            </StyledCarousel>
        )
    }
}

RelatedContributionCarousel.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    contributions: PropTypes.array.isRequired,
    authors: PropTypes.array.isRequired,
    openDialog: PropTypes.func.isRequired,
    dropped: PropTypes.func.isRequired,
};

export default RelatedContributionCarousel;
